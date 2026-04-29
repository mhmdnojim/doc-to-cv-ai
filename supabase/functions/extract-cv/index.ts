import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { BlobReader, ZipReader, TextWriter } from "https://deno.land/x/zipjs@v2.7.45/index.js";

// Extract plain text from a .docx buffer by unzipping and parsing word/document.xml.
async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const blob = new Blob([bytes]);
  const reader = new ZipReader(new BlobReader(blob));
  const entries = await reader.getEntries();
  const docEntry = entries.find((e: any) => e.filename === "word/document.xml");
  if (!docEntry || !docEntry.getData) throw new Error("word/document.xml not found in .docx");
  const xml: string = await docEntry.getData(new TextWriter());
  await reader.close();
  // Convert paragraph/line breaks to newlines, then strip remaining tags.
  const withBreaks = xml
    .replace(/<w:p[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:br[^>]*\/?>/g, "\n")
    .replace(/<w:tab[^>]*\/?>/g, "\t");
  const text = withBreaks
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCHEMA = {
  type: "object",
  properties: {
    fullName: { type: "string" },
    jobTitle: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    location: { type: "string" },
    website: { type: "string" },
    summary: { type: "string" },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" }, company: { type: "string" }, position: { type: "string" },
          startDate: { type: "string" }, endDate: { type: "string" }, location: { type: "string" }, description: { type: "string" }
        },
        required: ["id", "company", "position", "startDate", "endDate", "location", "description"],
        additionalProperties: false
      }
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" }, school: { type: "string" }, degree: { type: "string" },
          field: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }
        },
        required: ["id", "school", "degree", "field", "startDate", "endDate"],
        additionalProperties: false
      }
    },
    skills: { type: "array", items: { type: "string" } },
    languages: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "string" }, name: { type: "string" }, level: { type: "string" } },
        required: ["id", "name", "level"],
        additionalProperties: false
      }
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "string" }, name: { type: "string" }, description: { type: "string" }, link: { type: "string" } },
        required: ["id", "name", "description", "link"],
        additionalProperties: false
      }
    }
  },
  required: ["fullName", "jobTitle", "email", "phone", "location", "website", "summary", "experience", "education", "skills", "languages", "projects"],
  additionalProperties: false
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, fileBase64, mimeType, fileName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // ----- Pre-process unsupported file types into plain text -----
    // Gemini does NOT accept .docx/.doc/.txt directly; only PDFs and images.
    // We extract text server-side and pass it as `text` instead.
    let extractedText = text as string | undefined;
    let fileForVision: { base64: string; mime: string } | null = null;

    if (!extractedText && fileBase64) {
      const lowerName = (fileName || "").toLowerCase();
      const mt = (mimeType || "").toLowerCase();
      const isDocx = mt.includes("officedocument.wordprocessingml") || lowerName.endsWith(".docx");
      const isPlainText = mt.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md");
      const isPdf = mt === "application/pdf" || lowerName.endsWith(".pdf");
      const isImage = mt.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(lowerName);

      // Decode base64 → Uint8Array
      const decodeB64 = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

      if (isDocx) {
        try {
          const buf = decodeB64(fileBase64);
          extractedText = await extractDocxText(buf);
          if (!extractedText) throw new Error("empty docx text");
        } catch (err) {
          console.error("docx extract failed:", err);
          throw new Error("Failed to read .docx file. Try exporting it as PDF and re-uploading.");
        }
      } else if (isPlainText) {
        try {
          extractedText = new TextDecoder("utf-8").decode(decodeB64(fileBase64));
        } catch (err) {
          console.error("text decode failed:", err);
          throw new Error("Failed to read text file.");
        }
      } else if (isPdf || isImage) {
        fileForVision = { base64: fileBase64, mime: mimeType || (isPdf ? "application/pdf" : "image/png") };
      } else {
        throw new Error(`Unsupported file type: ${mimeType || fileName}. Please upload a PDF, image, .docx or .txt file.`);
      }
    }

    const userContent: any[] = [
      {
        type: "text",
        text:
          `Extract structured CV / resume data from the attached ${extractedText ? "text" : "document"}. ` +
          `Filename: ${fileName || "unknown"}. ` +
          `The document may be in ANY language — including Chinese (中文), Kazakh (Қазақша), Bulgarian (Български), Turkmen (Türkmençe), Arabic (العربية), Indonesian (Bahasa Indonesia), or others. ` +
          `PRESERVE THE ORIGINAL LANGUAGE AND SCRIPT exactly as written — do NOT translate to English. ` +
          `Be thorough — read every page, extract every job, every degree, every skill, every language, every project. ` +
          `Use empty strings for missing fields. Give each item a unique short id like "1","2","3". ` +
          `If the document is clearly NOT a CV/resume, return all empty fields rather than inventing data.`
      }
    ];
    if (extractedText) {
      userContent.push({ type: "text", text: `\n\nCV CONTENT:\n${extractedText}` });
    } else if (fileForVision) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${fileForVision.mime};base64,${fileForVision.base64}` }
      });
    } else {
      throw new Error("No text or file provided");
    }

    // Use a vision-capable model — gemini-2.5-pro handles PDFs + complex layouts best.
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are an expert multilingual CV/resume parser. You fluently read and parse resumes written in ANY language and script, including but not limited to: English, Chinese (Simplified 简体中文 and Traditional 繁體中文), Kazakh (Қазақша, both Cyrillic and Latin), Bulgarian (Български), Turkmen (Türkmençe / Türkmen, Latin and Cyrillic), Arabic (العربية, right-to-left), Indonesian (Bahasa Indonesia), Russian, Spanish, French, German, Portuguese, Japanese, Korean, Hindi, Urdu, Persian, Turkish, etc. CRITICAL RULES: (1) PRESERVE THE ORIGINAL LANGUAGE AND SCRIPT of the document — do NOT translate names, job titles, companies, schools, descriptions, skills, or summaries. Keep Chinese characters as Chinese, Arabic as Arabic, Cyrillic as Cyrillic, etc. (2) Correctly handle right-to-left scripts (Arabic). (3) Recognize section headings in any language (e.g. 工作经验, خبرة العمل, Жұмыс тәжірибесі, Опит, Iş tejribesi, Pengalaman Kerja all mean 'Experience'). (4) Read the entire document including scanned pages and images. (5) ALWAYS call the extract_cv function with the data you find." },
          { role: "user", content: userContent }
        ],
        tools: [{
          type: "function",
          function: { name: "extract_cv", description: "Return structured CV data", parameters: SCHEMA }
        }],
        tool_choice: { type: "function", function: { name: "extract_cv" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured output returned");
    const cv = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ cv }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("extract-cv error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

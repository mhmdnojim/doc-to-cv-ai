import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const userContent: any[] = [
      {
        type: "text",
        text:
          `Extract structured CV / resume data from the attached ${text ? "text" : "document"}. ` +
          `Filename: ${fileName || "unknown"}. ` +
          `Be thorough — read every page, extract every job, every degree, every skill, every language, every project. ` +
          `Use empty strings for missing fields. Give each item a unique short id like "1","2","3". ` +
          `If the document is clearly NOT a CV/resume, return all empty fields rather than inventing data.`
      }
    ];
    if (text) {
      userContent.push({ type: "text", text: `\n\nCV CONTENT:\n${text}` });
    } else if (fileBase64) {
      // Lovable AI gateway / Gemini accepts PDFs and images via the OpenAI-compatible
      // image_url data-URL field. This works for application/pdf, image/png, image/jpeg, etc.
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType || "application/pdf"};base64,${fileBase64}` }
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
          { role: "system", content: "You are an expert CV/resume parser. Read the entire document, including scanned pages and images, and extract all structured information accurately. ALWAYS call the extract_cv function with the data you find." },
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

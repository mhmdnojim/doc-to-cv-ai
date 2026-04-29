import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You convert a screenshot of a CV/resume layout into a self-contained HTML+inline-CSS template.

REQUIREMENTS:
1. Output ONLY the HTML body (no <html>, <head>, <body> wrapper, no markdown fences).
2. Root element: <div style="width:794px;min-height:1123px;background:#fff;..."> matching A4.
3. Use ONLY inline styles (style="..."), no <style>, no classes, no external fonts.
4. Replicate the visual layout, color palette, typography, columns, and section ordering of the screenshot AS CLOSELY AS POSSIBLE.
5. Use these EXACT placeholder tokens that will be substituted at render time. Do NOT invent other tokens:
   {{fullName}}, {{jobTitle}}, {{email}}, {{phone}}, {{location}}, {{website}}, {{summary}}
   PHOTO HANDLING — IMPORTANT:
   - Look carefully at the screenshot. If it shows a profile photo, avatar circle, headshot area, or any reserved space for a personal picture (typically near the name/header), you MUST include a photo slot.
   - Render the photo slot with the EXACT token {{photo}} as the src of an <img>, like:
     <img src="{{photo}}" alt="" style="width:120px;height:120px;border-radius:50%;object-fit:cover;display:block;" />
   - Match the original size, shape (circle/square/rounded), border, and position of the photo from the screenshot.
   - If the screenshot has NO photo area at all, do NOT include {{photo}}.
   For lists, use these block markers — keep them on their own lines, do NOT wrap them in extra elements:
   {{#experience}} ... {{position}} ... {{company}} ... {{startDate}} ... {{endDate}} ... {{location}} ... {{description}} ... {{/experience}}
   {{#education}} ... {{degree}} ... {{field}} ... {{school}} ... {{startDate}} ... {{endDate}} ... {{/education}}
   {{#skills}} {{.}} {{/skills}}
   {{#languages}} {{name}} ... {{level}} {{/languages}}
   {{#projects}} {{name}} ... {{description}} ... {{link}} {{/projects}}
6. Section headings should be readable plain text (e.g. "EXPERIENCE", "EDUCATION", "SKILLS") so the editor can detect and add/delete them.
7. Make sure the design works even if some fields are empty.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { imageUrl, name } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: [
            { type: "text", text: `Generate a CV template that visually replicates this screenshot. Template name: "${name || "User template"}".` },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      throw new Error("AI generation failed");
    }
    const data = await resp.json();
    let html: string = data.choices?.[0]?.message?.content || "";
    // Strip accidental markdown fences
    html = html.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();
    if (!html.includes("{{fullName}}")) {
      console.warn("Generated template missing placeholders; returning anyway");
    }

    return new Response(JSON.stringify({ html }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("generate-template error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

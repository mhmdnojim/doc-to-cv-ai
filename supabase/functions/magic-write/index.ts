import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, selection, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const system = `You are Magic Write, an AI writing assistant inside a CV/resume editor.
You ALWAYS reply with the rewritten/generated text ONLY — no preface, no explanation, no quotes.
Tone: professional, concise, results-driven. Use active verbs and quantify when reasonable.
Keep the output a similar length to the source unless the user explicitly asks otherwise.
Output plain text (no markdown), suitable to paste back into a contenteditable area.`;

    let userMsg = "";
    if (mode === "improve" && selection) {
      userMsg = `Improve this CV text. Fix grammar, sharpen wording, keep meaning:\n\n"""${selection}"""`;
    } else if (mode === "shorten" && selection) {
      userMsg = `Make this CV text more concise (about 50% shorter), keep key facts:\n\n"""${selection}"""`;
    } else if (mode === "expand" && selection) {
      userMsg = `Expand this CV bullet with more concrete impact and one quantifiable detail (keep it 1–2 sentences):\n\n"""${selection}"""`;
    } else if (selection && prompt) {
      userMsg = `Rewrite the following selected text according to this instruction.\nInstruction: ${prompt}\n\nSelected text:\n"""${selection}"""`;
    } else if (prompt) {
      userMsg = `Write CV-quality text for this request:\n${prompt}`;
    } else {
      throw new Error("Provide a prompt or select text first.");
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Please retry shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits depleted. Add funds in Lovable AI settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("magic-write error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

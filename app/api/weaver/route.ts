import { NextRequest, NextResponse } from "next/server";

const FREE_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3-coder:free",
  "google/gemma-3-12b-it:free",
  "qwen/qwen3-4b:free",
];

const SKIP_SIGNALS = [
  "rate limit", "ratelimit", "rate_limit", "quota exceeded", "too many requests",
  "provider error", "no endpoints", "model not found", "not a valid model",
  "insufficient credits", "payment required", "overloaded", "unavailable",
  "does not exist", "deprecated", "service unavailable", "429",
];

function shouldSkip(text: string): boolean {
  const lower = text.toLowerCase();
  return SKIP_SIGNALS.some(sig => lower.includes(sig));
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBoardroomPrompt(userPrompt: string): string {
  return `You are a world-class Executive Technology Consultant. Translate software architecture into executive business strategy.

AUDIENCE: C-suite executives, board members, investors. Non-technical.

RULES:
1. No raw acronyms without a glossary entry
2. Every keyBenefit must have a quantified metric
3. buildTime must be realistic
4. securityRating: exactly "Basic ★★☆☆☆" | "Standard ★★★☆☆" | "Advanced ★★★★☆" | "Enterprise-Grade ★★★★★"
5. mermaidDiagram: "graph TD", max 10 nodes, camelCase IDs, plain English labels
6. executiveInsights: one risk + one recommendation

Respond ONLY with valid JSON:
{
  "summary": { "buildTime": "string", "resourceComplexity": "string", "securityRating": "string" },
  "overview": "string",
  "keyBenefits": ["string"],
  "glossary": [{ "term": "string", "translation": "string" }],
  "mermaidDiagram": "string",
  "executiveInsights": "string"
}

No markdown fences. ONLY JSON.

PRODUCT: ${userPrompt}`;
}

function getEngineRoomPrompt(userPrompt: string): string {
  return `You are a Principal Systems Architect designing at 100M+ user scale.

MERMAID: flowchart LR, camelCase IDs, labels in ["quotes"], subgraphs end with "end", max 20 nodes, --> arrows only.
SQL: UUID PK, timestamps, indexes, FK ON DELETE, CHECK constraints.
API: /api/v1/ prefix, realistic JSON, min 5 endpoints, include webhook.
SECURITY: JWT TTL, rate limits, 3+ OWASP items.
EDGE CASES: race condition, thundering herd, data consistency, cascade failure with mitigations.

Respond ONLY with valid JSON:
{
  "technicalOverview": "string",
  "mermaidDiagram": "string",
  "sqlSchema": "string",
  "apiSpec": [{ "method": "string", "path": "string", "description": "string", "requestBody": {}, "response": {} }],
  "glossary": [{ "term": "string", "translation": "string" }],
  "securityAnalysis": "string",
  "edgeCases": ["string"]
}

No markdown fences. ONLY JSON.

SYSTEM: ${userPrompt}`;
}

function extractJSON(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw.trim()); } catch { /* */ }
  const clean = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  try { return JSON.parse(clean); } catch { /* */ }
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try { return JSON.parse(raw.slice(first, last + 1)); } catch { /* */ }
  }
  throw new Error("Could not extract valid JSON");
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, viewMode } = await req.json() as { prompt: string; viewMode: "Boardroom" | "EngineRoom" };

    if (!prompt?.trim() || !viewMode) {
      return NextResponse.json({ error: "Missing prompt or viewMode." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY not set." }, { status: 500 });
    }

    const systemPrompt = viewMode === "Boardroom" ? getBoardroomPrompt(prompt) : getEngineRoomPrompt(prompt);
    const userMessage = viewMode === "Boardroom"
      ? `Generate a board-ready executive architecture overview for: ${prompt}`
      : `Generate production-ready technical architecture specs for: ${prompt}`;

    let lastError = "Unknown error";

    for (let i = 0; i < FREE_MODELS.length; i++) {
      const model = FREE_MODELS[i];
      try {
        console.log(`[Specweaver] Trying: ${model}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "X-Title": "Specweaver",
          },
          body: JSON.stringify({
            model,
            temperature: 0,
            max_tokens: 8000,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          }),
          signal: AbortSignal.timeout(120000), // 2 min timeout
        });

        // Skip on bad HTTP status — don't throw, just try next model
        if (response.status === 429 || response.status === 503 || response.status === 502) {
          console.log(`[Specweaver] HTTP ${response.status} on ${model}, trying next...`);
          await sleep(1500); // brief pause before next attempt
          continue;
        }

        if (response.status === 400 || response.status === 402 || response.status === 404) {
          console.log(`[Specweaver] HTTP ${response.status} on ${model}, skipping...`);
          continue;
        }

        const body = await response.text();

        if (shouldSkip(body)) {
          console.log(`[Specweaver] Skip signal in body from ${model}`);
          await sleep(1000);
          continue;
        }

        if (!response.ok) {
          lastError = `HTTP ${response.status}: ${body.slice(0, 200)}`;
          console.log(`[Specweaver] Error on ${model}: ${lastError}`);
          continue;
        }

        let data;
        try {
          data = JSON.parse(body);
        } catch {
          lastError = `Response not JSON from ${model}`;
          continue;
        }

        // Check for error in response body
        if (data.error) {
          const errMsg = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
          if (shouldSkip(errMsg)) {
            console.log(`[Specweaver] Error object skip on ${model}: ${errMsg.slice(0, 100)}`);
            await sleep(1000);
            continue;
          }
          lastError = errMsg;
          continue;
        }

        // Extract the AI content
        const content = data?.choices?.[0]?.message?.content;
        if (!content || !content.trim()) {
          lastError = `Empty content from ${model}`;
          continue;
        }

        if (shouldSkip(content)) {
          console.log(`[Specweaver] Content skip signal on ${model}`);
          continue;
        }

        // Parse the JSON from AI response
        try {
          const parsed = extractJSON(content);
          console.log(`[Specweaver] ✓ Success with ${model}`);
          return NextResponse.json(parsed);
        } catch {
          lastError = `JSON parse failed on ${model}`;
          console.error(`[Specweaver] JSON parse failed on ${model}:`, content.slice(0, 300));
          continue;
        }

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[Specweaver] Exception on ${model}: ${msg.slice(0, 150)}`);

        if (msg.includes("abort") || msg.includes("timeout")) {
          lastError = `Timeout on ${model}`;
          continue;
        }

        if (shouldSkip(msg)) {
          await sleep(1000);
          continue;
        }

        lastError = msg;
        continue;
      }
    }

    return NextResponse.json({
      error: `All ${FREE_MODELS.length} models failed. Last error: ${lastError}. Try again in 1-2 minutes.`
    }, { status: 500 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
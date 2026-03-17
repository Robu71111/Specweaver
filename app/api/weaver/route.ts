import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-3-12b-it:free",
  "qwen/qwen3-4b:free",
];

const SKIP_SIGNALS = [
  "rate limit","ratelimit","quota exceeded","too many requests",
  "provider error","no endpoints","model not found","not a valid model",
  "insufficient credits","payment required","overloaded","unavailable",
  "does not exist","deprecated","service unavailable",
];

function shouldSkip(text: string): boolean {
  const lower = text.toLowerCase();
  return SKIP_SIGNALS.some(sig => lower.includes(sig));
}

function getBoardroomPrompt(userPrompt: string): string {
  return `You are a world-class Executive Technology Consultant with 25 years advising Fortune 500 boards. You translate software architecture into executive business strategy.

AUDIENCE: C-suite executives, board members, investors. Highly intelligent but non-technical.

STRICT OUTPUT RULES:
1. Never write a raw acronym without a matching glossary entry
2. Every keyBenefit must contain a specific quantified metric
3. buildTime must be realistic — never optimistic
4. securityRating: exactly one of "Basic ★★☆☆☆" | "Standard ★★★☆☆" | "Advanced ★★★★☆" | "Enterprise-Grade ★★★★★"
5. mermaidDiagram: use "graph TD", max 10 nodes, plain English labels, camelCase IDs only
6. keyBenefits must be specific to THIS product
7. executiveInsights must name one concrete risk and one actionable recommendation

Respond with ONLY a valid JSON object:
{
  "summary": { "buildTime": "string", "resourceComplexity": "string", "securityRating": "string" },
  "overview": "string",
  "keyBenefits": ["string"],
  "glossary": [{ "term": "string", "translation": "string" }],
  "mermaidDiagram": "string",
  "executiveInsights": "string"
}

No markdown fences. No explanation. ONLY the JSON object.

PRODUCT TO ARCHITECT:
${userPrompt}`;
}

function getEngineRoomPrompt(userPrompt: string): string {
  return `You are a Principal Systems Architect with 15 years designing systems at 100M+ user scale.

MERMAID DIAGRAM — use this EXACT structure:
flowchart LR
  clientApp["Web App"]
  subgraph APILayer["API Layer"]
    apiGateway["API Gateway"]
    authService["Auth Service"]
  end
  subgraph Services["Services"]
    coreService["Core Service"]
  end
  subgraph DataLayer["Data Layer"]
    postgres["PostgreSQL"]
    redis["Redis Cache"]
  end
  clientApp --> apiGateway
  apiGateway --> authService
  apiGateway --> coreService
  coreService --> postgres
  coreService --> redis

RULES: camelCase IDs, labels in ["quotes"], every subgraph ends with "end", max 20 nodes, --> arrows only.

SQL: UUID PK, timestamps, indexes with comments, FK ON DELETE, CHECK constraints.
API: /api/v1/ prefix, realistic JSON responses, min 5 endpoints, include one webhook.
SECURITY: JWT TTL, rate limits, 3+ OWASP items.
EDGE CASES: race condition, thundering herd, data consistency, cascade failure — each with mitigation.

Respond with ONLY a valid JSON object:
{
  "technicalOverview": "string",
  "mermaidDiagram": "string",
  "sqlSchema": "string",
  "apiSpec": [{ "method": "string", "path": "string", "description": "string", "requestBody": {}, "response": {} }],
  "glossary": [{ "term": "string", "translation": "string" }],
  "securityAnalysis": "string",
  "edgeCases": ["string"]
}

No markdown fences. No explanation. ONLY the JSON object.

SYSTEM TO ARCHITECT:
${userPrompt}`;
}

function extractJSON(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw.trim()); } catch { /* continue */ }
  const clean = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  try { return JSON.parse(clean); } catch { /* continue */ }
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try { return JSON.parse(raw.slice(first, last + 1)); } catch { /* continue */ }
  }
  throw new Error("Could not extract valid JSON from AI response");
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, viewMode } = await req.json() as { prompt: string; viewMode: "Boardroom" | "EngineRoom" };

    if (!prompt?.trim() || !viewMode) {
      return NextResponse.json({ error: "Missing prompt or viewMode." }, { status: 400 });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY not set." }, { status: 500 });
    }

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Specweaver",
      },
    });

    const systemPrompt = viewMode === "Boardroom" ? getBoardroomPrompt(prompt) : getEngineRoomPrompt(prompt);
    const userMessage = viewMode === "Boardroom"
      ? `Generate a board-ready executive architecture overview for: ${prompt}`
      : `Generate production-ready technical architecture specs for: ${prompt}`;

    let lastError = "Unknown error";

    for (const model of FREE_MODELS) {
      try {
        console.log(`[Specweaver] Trying: ${model}`);
        const completion = await client.chat.completions.create({
          model, temperature: 0, max_tokens: 8000,
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
        });

        const raw = completion.choices[0]?.message?.content ?? "";
        if (!raw.trim()) { lastError = `Empty response from ${model}`; continue; }
        if (shouldSkip(raw)) { console.log(`[Specweaver] Skip signal: ${model}`); continue; }

        try {
          const parsed = extractJSON(raw);
          console.log(`[Specweaver] Success: ${model}`);
          return NextResponse.json(parsed);
        } catch {
          lastError = `JSON parse failed on ${model}`;
          continue;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (shouldSkip(msg)) continue;
        lastError = msg;
        continue;
      }
    }

    return NextResponse.json({ error: `All models failed. ${lastError}. Try again in 1-2 minutes.` }, { status: 500 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

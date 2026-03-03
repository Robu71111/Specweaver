// app/api/weaver/route.ts
// ─────────────────────────────────────────────────────────────────────────────
//  PROVIDER: OpenRouter — one API key, 290+ models, free tier, no credit card
//  Sign up:  https://openrouter.ai  → Dashboard → API Keys → Create Key
//  Add to .env.local:  OPENROUTER_API_KEY=sk-or-...
//  Install:  npm install openai   (OpenRouter uses the OpenAI SDK format)
//
//  TO SWITCH MODELS: change ACTIVE_MODEL below. That's it. No reinstalls.
//
//  FREE MODELS (200 requests/day, no credit card):
//  ┌─────────────────────────────────────────────────────┬─────────┬──────────┐
//  │ Model ID                                            │ Context │ Quality  │
//  ├─────────────────────────────────────────────────────┼─────────┼──────────┤
//  │ meta-llama/llama-3.3-70b-instruct:free              │  128K   │ ★★★★★   │ ← default
//  │ deepseek/deepseek-r1:free                           │  128K   │ ★★★★★   │ best reasoning
//  │ qwen/qwen3-235b-a22b:free                           │  128K   │ ★★★★★   │ huge model
//  │ google/gemini-2.0-flash-exp:free                    │    1M   │ ★★★★☆   │ massive context
//  │ microsoft/phi-4-reasoning:free                      │  128K   │ ★★★★☆   │ good reasoning
//  └─────────────────────────────────────────────────────┴─────────┴──────────┘
//
//  GROQ (alternative — faster, 14,400 req/day free):
//  If you prefer Groq instead, comment out the OpenRouter block below and
//  uncomment the Groq block. Get key at console.groq.com (no credit card).
//  npm install groq-sdk
//  Add to .env.local: GROQ_API_KEY=gsk_...
//  Groq model IDs: "llama-3.3-70b-versatile" | "llama-3.1-70b-versatile"
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";  // OpenRouter is OpenAI-compatible — same SDK

// ── ✏️  CHANGE THIS ONE LINE TO SWITCH MODELS ─────────────────────────────────
const ACTIVE_MODEL = "openrouter/free";
// ─────────────────────────────────────────────────────────────────────────────

// ── System prompts ─────────────────────────────────────────────────────────────
function getBoardroomPrompt(userPrompt: string): string {
  return `You are a world-class Executive Technology Consultant with 25 years advising Fortune 500 boards. You translate software architecture into executive business strategy.

AUDIENCE: C-suite executives, board members, investors. Highly intelligent but non-technical.

STRICT OUTPUT RULES — violating any rule makes the output unacceptable:
1. Never write a raw acronym (API, SQL, CDN, JWT, RBAC, OAuth, etc.) without a matching entry in the glossary array
2. Every item in keyBenefits must contain a specific quantified metric (e.g. "reduces onboarding time by ~40%")
3. buildTime must be realistic for the described complexity — never optimistic
4. securityRating must be exactly one of: "Basic ★★☆☆☆" | "Standard ★★★☆☆" | "Advanced ★★★★☆" | "Enterprise-Grade ★★★★★"
5. mermaidDiagram: use "graph TD" syntax, maximum 10 nodes, plain English labels, node IDs must be single camelCase words (userApp, paymentGateway — no spaces, no quotes, no special chars in IDs)
6. keyBenefits must be specific to THIS product — no generic statements like "improves efficiency"
7. executiveInsights must name at least one concrete risk and one actionable recommendation
8. Self-check: scan every sentence you write — any technical term must be in the glossary

You MUST respond with ONLY a valid JSON object with this exact shape:
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
  return `You are a Principal Systems Architect with 15 years designing systems at 100M+ user scale. Your specifications are handed directly to engineering teams to begin Sprint 1.

AUDIENCE: Senior engineers and tech leads who will implement this immediately.

STRICT OUTPUT RULES — all mandatory:

MERMAID DIAGRAM — follow this EXACT structure or the diagram will fail to render:

The output must look EXACTLY like this template (fill in your own node IDs and labels):

flowchart LR
  clientApp["Web App"]
  subgraph APILayer["API Layer"]
    apiGateway["API Gateway"]
    authService["Auth Service"]
  end
  subgraph Services["Services"]
    coreService["Core Service"]
    workerService["Worker Service"]
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
  workerService --> postgres

RULES YOU MUST FOLLOW:
1. Every subgraph MUST end with the word "end" on its own line — this is NOT optional
2. Node IDs: camelCase only, no spaces, no special characters (apiGateway ✓, "API Gateway" as ID ✗)
3. Node labels in square brackets with quotes: apiGateway["API Gateway"] ✓
4. Subgraph labels in quotes: subgraph APILayer["API Layer"] ✓
5. Maximum 20 nodes total — keep it focused
6. NO semicolons, NO classDef, NO click handlers, NO style blocks
7. Arrows use --> only, never --- or ==>

SQL SCHEMA:
- UUID PK using gen_random_uuid() on every table
- created_at and updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() on every table
- At least one CREATE INDEX per table with a comment explaining which query it serves
- Every foreign key must have explicit ON DELETE behavior
- CHECK constraints on any status/type/role column

API SPEC:
- All paths: /api/v1/ prefix
- Every response must be a realistic nested JSON object — no placeholder strings
- Include at least one webhook or streaming endpoint
- Minimum 5 endpoints

SECURITY ANALYSIS:
- State exact JWT strategy: access token TTL, refresh token rotation policy
- Include specific rate limit numbers (e.g. "100 req/min per IP on auth endpoints")  
- Address at least 3 OWASP Top 10 items specific to this system

EDGE CASES — must be system-specific, not generic:
- One race condition with mitigation
- One thundering herd scenario with mitigation
- One data consistency failure with mitigation
- One cascade failure with mitigation

You MUST respond with ONLY a valid JSON object with this exact shape:
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

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { prompt, viewMode } = await req.json() as {
      prompt: string;
      viewMode: "Boardroom" | "EngineRoom";
    };

    if (!prompt?.trim() || !viewMode) {
      return NextResponse.json({ error: "Missing prompt or viewMode." }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        error: "OPENROUTER_API_KEY not set. Get a free key at openrouter.ai → Dashboard → API Keys, then add OPENROUTER_API_KEY=sk-or-... to your .env.local file."
      }, { status: 500 });
    }

    // OpenRouter uses the exact same SDK as OpenAI — just swap the baseURL
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Specweaver",
      },
    });

    const systemPrompt = viewMode === "Boardroom"
      ? getBoardroomPrompt(prompt)
      : getEngineRoomPrompt(prompt);

    const completion = await client.chat.completions.create({
      model: ACTIVE_MODEL,
      temperature: 0,          // zero randomness = maximum accuracy
      max_tokens: 8000,
      response_format: { type: "json_object" }, // forces valid JSON output
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: viewMode === "Boardroom"
            ? `Generate a board-ready executive architecture overview for this product: ${prompt}`
            : `Generate complete production-ready technical architecture specifications for this system: ${prompt}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: Record<string, unknown>;
    try {
      // Strip any accidental markdown fences just in case
      const clean = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("JSON parse failed. Raw response:", raw.slice(0, 600));
      return NextResponse.json({
        error: "AI returned malformed JSON. Try again — if this persists, try switching ACTIVE_MODEL in route.ts to 'deepseek/deepseek-r1:free'."
      }, { status: 500 });
    }

    return NextResponse.json(parsed);

  } catch (err: unknown) {
    console.error("Weaver route error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";

    if (msg.includes("429") || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("quota")) {
      return NextResponse.json({
        error: `Rate limit reached on ${ACTIVE_MODEL}. You have 200 free requests/day on OpenRouter. Wait a minute and try again, or change ACTIVE_MODEL in route.ts to try a different free model.`
      }, { status: 429 });
    }

    if (msg.includes("401") || msg.toLowerCase().includes("auth")) {
      return NextResponse.json({
        error: "Invalid OpenRouter API key. Check that OPENROUTER_API_KEY in .env.local starts with 'sk-or-' and matches exactly what's shown at openrouter.ai/settings/keys"
      }, { status: 401 });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
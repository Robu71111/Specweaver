# ⚡ Specweaver v2.0

> Dual-persona system architecture generator. Boardroom clarity meets engineering precision.

---

## ✦ What It Does

**Specweaver** is an AI-powered architecture generator with two radically different UX personas:

| Mode | Persona | Aesthetic | Output |
|------|---------|-----------|--------|
| **Boardroom** | CEO / Manager | Minimalist Apple-white | Summary cards, executive translations, high-level diagrams |
| **Engine Room** | Tech Lead / Architect | Cyber-grid dark | Full schemas, API specs, flowcharts, edge case analysis |

### The Executive Translator™
Technical terms in every output are highlighted with dotted underlines. Hover to see a plain-English explanation — bridging the gap between engineering and business.

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

```bash
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key
```

Get your key at [console.anthropic.com](https://console.anthropic.com)

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Architecture

```
specweaver/
├── app/
│   ├── page.tsx              ← Main dual-persona UI (all components inline)
│   ├── layout.tsx            ← Root layout + metadata
│   ├── globals.css           ← Tailwind base + custom scrollbars
│   └── api/
│       └── weaver/
│           └── route.ts      ← Next.js Route Handler → Anthropic Claude
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🧠 How the AI Works

### System Prompt Selection (`getSystemPrompt(viewMode)`)

**Boardroom:**
> "Act as an Executive Tech Consultant. Deliver strategic overview. No jargon. Use glossary to bridge gaps. Return JSON with summary cards, business benefits, and Mermaid diagram."

**Engine Room:**
> "Act as a Principal Systems Architect. Deliver production-ready specs: flowchart LR diagram, SQL DDL with indexes, full REST API spec, security analysis, edge cases."

### Response Shape
The AI always returns a strictly-typed JSON object parsed client-side and rendered into the appropriate UI components.

---

## 🎨 Design System

### Boardroom (Light)
- Font: DM Sans + DM Serif Display
- Colors: White, slate-50, indigo accents
- Cards: Subtle gradients, soft shadows, hover lift

### Engine Room (Dark)
- Font: Fira Code (monospace throughout)
- Background: `#0a0a0a` with blue-900 grid overlay
- Accents: Electric blue `#3b82f6` with `drop-shadow` glow
- Effects: Typewriter text, glowing Mermaid diagrams, pulsing status indicators

---

## 🔧 Extending

### Add PDF Export
In Boardroom mode, the "Export as PDF" button is a placeholder. To implement:
```bash
npm install jspdf html2canvas
```
Then call `html2canvas` on the output container and `jsPDF.addImage()`.

### Swap AI Provider
Edit `app/api/weaver/route.ts` — replace the Anthropic client with your preferred provider (OpenAI, Gemini, etc.) while keeping the same system prompt logic.

---

## 📄 License

MIT — build something extraordinary.

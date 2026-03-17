"use client";

import {
  useState, useEffect, useRef, useCallback,
  type ChangeEvent,
} from "react";
import {
  Cpu, Shield, Clock, TrendingUp, Users, Download,
  ChevronRight, Terminal, Database, Layers, GitBranch,
  Loader2, AlertTriangle, Copy, Check,
  Braces, FileCode, Network, Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewMode = "Boardroom" | "EngineRoom";
interface GlossaryItem { term: string; translation: string; }
interface BoardroomData {
  summary: { buildTime: string; resourceComplexity: string; securityRating: string };
  overview: string; keyBenefits: string[];
  glossary: GlossaryItem[]; mermaidDiagram: string; executiveInsights: string;
}
interface ApiEndpoint {
  method: string; path: string; description: string;
  requestBody?: object; response: object;
}
interface EngineRoomData {
  technicalOverview: string; mermaidDiagram: string; sqlSchema: string;
  apiSpec: ApiEndpoint[]; glossary: GlossaryItem[];
  securityAnalysis: string; edgeCases: string[];
}

// ─── Mermaid Auto-Repair ──────────────────────────────────────────────────────
// Fixes the most common AI mistakes before Mermaid attempts to render.
function repairMermaid(raw: string): string {
  let code = raw.trim();

  // 1. Strip accidental markdown fences (using indexOf to avoid regex backtick issues)
  if (code.startsWith("```")) {
    const firstNewline = code.indexOf("\n");
    code = firstNewline !== -1 ? code.slice(firstNewline + 1) : code.slice(3);
  }
  if (code.endsWith("```")) {
    code = code.slice(0, code.lastIndexOf("```")).trim();
  }
  code = code.trim();

  // 2. Ensure starts with flowchart LR
  if (!code.startsWith("flowchart") && !code.startsWith("graph")) {
    code = "flowchart LR\n" + code;
  }
  // Normalise graph TD / flowchart TD → flowchart LR
  code = code.replace(/^graph (TD|TB|BT|RL|LR)/i, "flowchart LR");
  code = code.replace(/^flowchart (TD|TB|BT|RL)/i, "flowchart LR");

  // 3. Fix missing "end" for subgraphs — the #1 AI mistake
  const lines = code.split("\n");
  const fixed: string[] = [];
  let depth = 0;
  for (const line of lines) {
    const t = line.trim().toLowerCase();
    if (t.startsWith("subgraph")) {
      depth++;
      fixed.push(line);
    } else if (t === "end") {
      depth = Math.max(0, depth - 1);
      fixed.push(line);
    } else {
      fixed.push(line);
    }
  }
  while (depth > 0) { fixed.push("  end"); depth--; }
  code = fixed.join("\n");

  // 4. Remove illegal Mermaid syntax using filter/map (no problematic regex)
  code = code
    .split("\n")
    .filter(line => {
      const t = line.trim();
      if (t.startsWith("classDef "))                 return false;
      if (t.startsWith("click "))                    return false;
      if (t.startsWith("style ") && !t.includes("-->")) return false;
      if (/^class \S+ \S+$/.test(t))                 return false;
      return true;
    })
    .map(line => line.replace(/;$/, ""))
    .map(line => line.replace(/==>/, "-->"))
    .map(line => line.replace(/--->/, "-->"))
    .map(line => line.trimEnd())
    .join("\n");

  // 5. Collapse excess blank lines
  while (code.includes("\n\n\n")) code = code.replace(/\n\n\n/g, "\n\n");

  return code.trim();
}

// ─── Shared Logo SVG ──────────────────────────────────────────────────────────
function SpecweaverLogo({ size = 28, dark = false }: { size?: number; dark?: boolean }) {
  const c = dark ? "#22d3ee" : "#6366f1";
  const fill = dark ? "rgba(0,200,255,0.15)" : "rgba(99,102,241,0.15)";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Specweaver">
      <polygon points="16,2 27,8.5 27,23.5 16,30 5,23.5 5,8.5"
        fill="none" stroke={c} strokeWidth="1.4" opacity="0.9"/>
      <polygon points="16,7.5 22,11 22,21 16,24.5 10,21 10,11"
        fill={fill} stroke={c} strokeWidth="0.9" opacity="0.7"/>
      {([[16,2],[27,8.5],[27,23.5],[16,30],[5,23.5],[5,8.5]] as [number,number][]).map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="2" fill={c} opacity="0.95"/>
      ))}
      <circle cx="16" cy="16" r="3" fill={c}/>
      {([[16,2],[27,23.5],[5,23.5]] as [number,number][]).map(([x2,y2],i)=>(
        <line key={i} x1="16" y1="16" x2={x2} y2={y2} stroke={c} strokeWidth="0.9" opacity="0.5"/>
      ))}
    </svg>
  );
}

// ─── AnimatedGrid (behind Engine Room input box) ──────────────────────────────
function AnimatedGrid() {
  return (
    <div aria-hidden style={{position:"absolute",inset:-3,borderRadius:16,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.55) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(0,200,255,0.55) 1.5px,transparent 1.5px)",backgroundSize:"32px 32px",animation:"gridBreathe 3s ease-in-out infinite"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,230,255,0.85) 2px,transparent 2px),linear-gradient(90deg,rgba(0,230,255,0.85) 2px,transparent 2px)",backgroundSize:"96px 96px",animation:"gridBreathe 3s ease-in-out infinite",animationDelay:"0.3s"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(0,200,255,0.18),transparent)",backgroundSize:"60px 100%",animation:"scanH 2.5s linear infinite"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent,rgba(0,200,255,0.10),transparent)",backgroundSize:"100% 80px",animation:"scanV 4s linear infinite"}}/>
      <div style={{position:"absolute",inset:0,borderRadius:16,border:"2px solid rgba(0,210,255,0.9)",boxShadow:"0 0 28px rgba(0,210,255,0.7),inset 0 0 28px rgba(0,210,255,0.18)",animation:"borderPulse 3s ease-in-out infinite"}}/>
      {([
        {top:0,left:0,borderTop:"3px solid",borderLeft:"3px solid"},
        {top:0,right:0,borderTop:"3px solid",borderRight:"3px solid"},
        {bottom:0,left:0,borderBottom:"3px solid",borderLeft:"3px solid"},
        {bottom:0,right:0,borderBottom:"3px solid",borderRight:"3px solid"},
      ] as React.CSSProperties[]).map((s,i)=>(
        <div key={i} style={{position:"absolute",...s,width:20,height:20,borderColor:"rgba(0,230,255,1)",boxShadow:"0 0 10px rgba(0,230,255,0.9)",animation:"cornerPulse 1.8s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>
      ))}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:6,height:6,borderRadius:"50%",background:"rgba(0,220,255,0.9)",boxShadow:"0 0 14px 5px rgba(0,200,255,0.6)",animation:"dotPulse 2.2s ease-in-out infinite"}}/>
    </div>
  );
}

// ─── MermaidDiagram ───────────────────────────────────────────────────────────
function MermaidDiagram({ code, darkMode }: { code: string; darkMode: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [svgReady, setSvgReady] = useState(false);

  useEffect(() => {
    if (!code || !ref.current) return;
    setError(null); setVisible(false); setSvgReady(false);
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: darkMode ? "dark" : "default",
          themeVariables: darkMode
            ? { primaryColor:"#1e40af", primaryTextColor:"#e2e8f0", primaryBorderColor:"#3b82f6",
                lineColor:"#60a5fa", background:"#0a0a0a", mainBkg:"#111827", nodeBorder:"#3b82f6",
                clusterBkg:"#111827", titleColor:"#60a5fa", edgeLabelBackground:"#1f2937", tertiaryColor:"#1f2937" }
            : { primaryColor:"#e0e7ff", primaryBorderColor:"#6366f1", lineColor:"#6366f1" },
          flowchart: { curve:"basis", htmlLabels:true },
          securityLevel: "loose",
        });

        const repairedCode = repairMermaid(code);
        const id = "mm" + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, repairedCode);

        if (ref.current) {
          ref.current.innerHTML = svg;
          setVisible(true); setSvgReady(true);

          const svgEl = ref.current.querySelector("svg");
          if (!svgEl) return;
          const nodes = Array.from(svgEl.querySelectorAll(".node"));
          const edges = Array.from(svgEl.querySelectorAll(".edgePath, .flowchart-link"));

          const nodeGlow = darkMode
            ? "drop-shadow(0 0 10px rgba(0,200,255,0.95)) drop-shadow(0 0 22px rgba(0,180,255,0.55))"
            : "drop-shadow(0 0 8px rgba(99,102,241,0.85)) drop-shadow(0 0 18px rgba(99,102,241,0.45))";
          const edgeGlow = darkMode
            ? "drop-shadow(0 0 5px rgba(0,200,255,0.8))"
            : "drop-shadow(0 0 4px rgba(99,102,241,0.7))";

          const resetAll = () => {
            nodes.forEach(n => { (n as HTMLElement).style.opacity="1"; (n as HTMLElement).style.filter="none"; });
            edges.forEach(e => { (e as HTMLElement).style.opacity="1"; (e as HTMLElement).style.filter="none"; });
          };

          nodes.forEach(node => {
            (node as HTMLElement).style.cursor = "pointer";
            (node as HTMLElement).style.transition = "opacity 0.18s, filter 0.18s";
            node.addEventListener("mouseenter", () => {
              nodes.forEach(n => { (n as HTMLElement).style.opacity="0.15"; (n as HTMLElement).style.filter="none"; });
              edges.forEach(e => { (e as HTMLElement).style.opacity="0.08"; });
              (node as HTMLElement).style.opacity = "1";
              (node as HTMLElement).style.filter = nodeGlow;
              edges.forEach(e => { (e as HTMLElement).style.opacity="0.8"; (e as HTMLElement).style.filter=edgeGlow; });
            });
          });
          svgEl.addEventListener("mouseleave", resetAll);
        }
      } catch (e) {
        setError("Diagram render error — AI generated invalid syntax. Try generating again.");
        console.error(e);
      }
    })();
  }, [code, darkMode]);

  const downloadPng = () => {
    const svgEl = ref.current?.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const scale = 2;
    const bbox = svgEl.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = (bbox.width || 900) * scale;
    canvas.height = (bbox.height || 600) * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = darkMode ? "#080f1e" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = "specweaver-diagram.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  };

  if (error) return (
    <div className={"rounded-xl p-4 border " + (darkMode ? "bg-red-950/30 border-red-800 text-red-300" : "bg-red-50 border-red-200 text-red-700")}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14}/><span className="text-xs font-medium">{error}</span>
      </div>
      <pre className={"text-xs overflow-x-auto p-2 rounded " + (darkMode ? "bg-black/50" : "bg-white")}>{code}</pre>
    </div>
  );

  return (
    <div className="relative">
      {svgReady && (
        <button onClick={downloadPng}
          className={"absolute top-2 right-2 z-10 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-mono transition-all " + (darkMode ? "bg-cyan-950/90 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900 hover:border-cyan-400" : "bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100")}
          style={darkMode ? {boxShadow:"0 0 12px rgba(0,200,255,0.2)"} : {}}>
          <Download size={11}/>&nbsp;PNG
        </button>
      )}
      <div ref={ref}
        className={"w-full overflow-x-auto rounded-xl p-3 sm:p-4 transition-opacity duration-500 " + (darkMode ? "bg-gray-950/50 border border-blue-500/20" : "bg-white/80 border border-indigo-100") + (visible ? " opacity-100" : " opacity-0")}
      />
    </div>
  );
}

// ─── GlossaryTerm ─────────────────────────────────────────────────────────────
function GlossaryTerm({ term, translation, darkMode }: { term:string; translation:string; darkMode:boolean }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <span onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}
        className={"cursor-help border-b-2 border-dotted transition-colors " + (darkMode ? "border-blue-400 text-blue-300 hover:text-blue-200" : "border-indigo-400 text-indigo-700 hover:text-indigo-900")}>
        {term}
      </span>
      {show && (
        <span className={"absolute bottom-full mb-2 z-50 w-60 rounded-lg p-3 text-xs shadow-2xl pointer-events-none " + (darkMode ? "bg-blue-900/95 border border-blue-500/50 text-blue-100" : "bg-white border border-indigo-200 text-gray-700")}
          style={{animation:"tipIn .15s ease-out both",left:"50%",transform:"translateX(-50%)"}}>
          <span className={"block font-semibold mb-1 " + (darkMode ? "text-blue-300" : "text-indigo-600")}>Plain English</span>
          {translation}
          <span className={"absolute top-full border-4 border-transparent " + (darkMode ? "border-t-blue-900" : "border-t-white")} style={{left:"50%",transform:"translateX(-50%)"}}/>
        </span>
      )}
    </span>
  );
}

function GlossaryText({ text, glossary, darkMode }: { text:string; glossary:GlossaryItem[]; darkMode:boolean }) {
  if (!glossary?.length) return <span>{text}</span>;
  const escaped = glossary.map(g => g.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  const parts = text.split(new RegExp("\\b(" + escaped.join("|") + ")\\b","gi"));
  const map = Object.fromEntries(glossary.map(g=>[g.term.toLowerCase(), g.translation]));
  return <>{parts.map((p,i) => map[p.toLowerCase()] ? <GlossaryTerm key={i} term={p} translation={map[p.toLowerCase()]} darkMode={darkMode}/> : <span key={i}>{p}</span>)}</>;
}

// ─── TypewriterText ───────────────────────────────────────────────────────────
function TypewriterText({ text, speed=5 }: { text:string; speed?:number }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setShown(""); setDone(false);
    if (!text) return;
    let i = 0;
    const t = setInterval(()=>{ setShown(text.slice(0,++i)); if(i>=text.length){setDone(true);clearInterval(t);} }, speed);
    return ()=>clearInterval(t);
  }, [text, speed]);
  return <span>{shown}{!done && <span className="animate-pulse text-cyan-400">|</span>}</span>;
}

// ─── CopyButton ───────────────────────────────────────────────────────────────
function CopyButton({ text, darkMode }: { text:string; darkMode:boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={()=>{ navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
      className={"flex items-center gap-1 text-xs px-2 py-1 rounded transition-all " + (darkMode ? "bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200")}>
      {copied ? <Check size={11}/> : <Copy size={11}/>}{copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── WeaveButton ──────────────────────────────────────────────────────────────
function WeaveButton({ loading, disabled, onClick, dark=false }: {loading:boolean;disabled:boolean;onClick:()=>void;dark?:boolean}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="relative flex items-center justify-center gap-2 px-6 py-2.5 font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden select-none rounded-lg"
      style={loading
        ? {background:"linear-gradient(90deg,#0369a1,#0ea5e9,#0369a1)",backgroundSize:"200%",animation:"gradMove 1.4s linear infinite"}
        : dark
          ? {background:"#0ea5e9",boxShadow:"0 0 24px rgba(14,165,233,0.6)"}
          : {background:"#1e293b",boxShadow:"0 4px 20px rgba(79,70,229,0.3)"}
      }>
      {loading && <span className="absolute inset-y-0 w-1/3 pointer-events-none" style={{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)",animation:"shimmer 1.1s linear infinite"}}/>}
      <span className="relative flex items-center gap-2">
        {loading ? <><Loader2 size={14} className="animate-spin"/>{dark ? "WEAVING..." : "Weaving..."}</> : <><Sparkles size={14}/>{dark ? "WEAVE SPEC" : "Weave Architecture"}</>}
      </span>
    </button>
  );
}

// ─── BoardroomOutput ──────────────────────────────────────────────────────────
function BoardroomOutput({ data }: { data: BoardroomData }) {
  const { summary, overview, keyBenefits, glossary, mermaidDiagram, executiveInsights } = data;
  return (
    <div style={{animation:"fadeInUp .45s ease both"}} className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {([
          {icon:Clock,      label:"Est. Build Time",    value:summary.buildTime,          from:"from-blue-50",   to:"to-indigo-50",  accent:"text-indigo-600", border:"border-indigo-100"},
          {icon:TrendingUp, label:"Resource Complexity",value:summary.resourceComplexity,  from:"from-violet-50", to:"to-purple-50",  accent:"text-violet-600", border:"border-violet-100"},
          {icon:Shield,     label:"Security Rating",    value:summary.securityRating,      from:"from-emerald-50",to:"to-teal-50",   accent:"text-emerald-600",border:"border-emerald-100"},
        ] as const).map(({icon:Icon,label,value,from,to,accent,border})=>(
          <div key={label} className={"bg-gradient-to-br " + from + " " + to + " rounded-2xl border " + border + " p-4 sm:p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"}>
            <Icon size={17} className={accent + " mb-2"}/>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={"text-xl sm:text-2xl font-semibold " + accent + " leading-tight"}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Strategic Overview</h3>
        <p className="text-slate-600 leading-relaxed text-sm"><GlossaryText text={overview} glossary={glossary} darkMode={false}/></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><Users size={14} className="text-indigo-500"/><h3 className="text-sm font-semibold text-slate-900">Business Outcomes</h3></div>
          <ul className="space-y-2.5">
            {keyBenefits.map((b,i)=>(
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                <GlossaryText text={b} glossary={glossary} darkMode={false}/>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
          <div className="flex items-center gap-2 mb-3"><Braces size={14} className="text-indigo-500"/><h3 className="text-sm font-semibold text-slate-900">Executive Translator</h3></div>
          <p className="text-xs text-slate-500 mb-3">Hover any <span className="border-b-2 border-dotted border-indigo-400 text-indigo-700">underlined term</span> for plain-English.</p>
          <div className="space-y-2.5">
            {glossary.slice(0,5).map(({term,translation})=>(
              <div key={term} className="bg-white/70 rounded-xl p-3 border border-indigo-100/50">
                <p className="text-xs font-semibold text-indigo-700 mb-0.5">{term}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{translation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2"><Network size={14} className="text-indigo-500"/><h3 className="text-sm font-semibold text-slate-900">System Architecture</h3></div>
          <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">High-Level View</span>
        </div>
        <MermaidDiagram code={mermaidDiagram} darkMode={false}/>
      </div>

      <div className="bg-slate-900 rounded-2xl p-5 sm:p-8 text-white">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-2">Executive Insights</p>
        <p className="text-slate-300 leading-relaxed text-sm"><GlossaryText text={executiveInsights} glossary={glossary} darkMode={true}/></p>
      </div>

      <div className="flex justify-end">
        <button onClick={()=>alert("PDF Export — connect jsPDF or Puppeteer in production.")}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
          <Download size={13}/> Export as PDF
        </button>
      </div>
    </div>
  );
}

// ─── EngineRoomOutput ─────────────────────────────────────────────────────────
function EngineRoomOutput({ data }: { data: EngineRoomData }) {
  const { technicalOverview, mermaidDiagram, sqlSchema, apiSpec, glossary, securityAnalysis, edgeCases } = data;
  const card: React.CSSProperties = {background:"rgba(8,18,36,0.9)",border:"1px solid rgba(0,160,255,0.2)",borderRadius:12,padding:"16px 20px"};
  return (
    <div style={{animation:"fadeInUp .45s ease both"}} className="space-y-4 sm:space-y-5">
      <div style={card}>
        <div className="flex items-center gap-2 mb-3"><FileCode size={13} className="text-cyan-400"/><span className="text-xs text-cyan-400 tracking-wide font-mono">TECHNICAL_OVERVIEW</span></div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono"><TypewriterText text={technicalOverview} speed={4}/></p>
      </div>

      <div style={card}>
        <div className="flex items-center gap-2 mb-3"><Network size={13} className="text-cyan-400"/><span className="text-xs text-cyan-400 tracking-wide font-mono">SYSTEM_ARCHITECTURE.FLOWCHART</span></div>
        <MermaidDiagram code={mermaidDiagram} darkMode={true}/>
      </div>

      <div style={card}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2"><Database size={13} className="text-cyan-400"/><span className="text-xs text-cyan-400 tracking-wide font-mono">DATABASE_SCHEMA.DDL</span></div>
          <CopyButton text={sqlSchema} darkMode={true}/>
        </div>
        <pre className="text-xs text-green-300/90 bg-black/60 rounded-lg p-4 overflow-x-auto border border-green-900/30 leading-relaxed font-mono">{sqlSchema}</pre>
      </div>

      <div style={card}>
        <div className="flex items-center gap-2 mb-3"><GitBranch size={13} className="text-cyan-400"/><span className="text-xs text-cyan-400 tracking-wide font-mono">API_SPECIFICATION.REST</span></div>
        <div className="space-y-3">
          {apiSpec.map((ep,i)=>(
            <div key={i} className="bg-black/50 rounded-lg p-3 sm:p-4" style={{border:"1px solid rgba(0,140,255,0.2)"}}>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={"text-xs font-bold tracking-wider font-mono " + (ep.method==="GET" ? "text-emerald-400" : ep.method==="POST" ? "text-blue-400" : ep.method==="PUT"||ep.method==="PATCH" ? "text-amber-400" : "text-red-400")}>{ep.method}</span>
                <code className="text-xs text-white bg-white/5 px-2 py-0.5 rounded break-all">{ep.path}</code>
                <span className="text-xs text-slate-500 sm:ml-auto">{ep.description}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ep.requestBody && (
                  <div>
                    <p className="text-xs text-cyan-700 mb-1 font-mono">// Request Body</p>
                    <pre className="text-xs text-slate-400 bg-black/40 p-2 rounded overflow-x-auto border border-slate-800 font-mono">{JSON.stringify(ep.requestBody,null,2)}</pre>
                  </div>
                )}
                <div className={ep.requestBody ? "" : "sm:col-span-2"}>
                  <p className="text-xs text-cyan-700 mb-1 font-mono">// Response</p>
                  <pre className="text-xs text-green-400/80 bg-black/40 p-2 rounded overflow-x-auto border border-slate-800 font-mono">{JSON.stringify(ep.response,null,2)}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={card}>
          <div className="flex items-center gap-2 mb-3"><Shield size={13} className="text-cyan-400"/><span className="text-xs text-cyan-400 tracking-wide font-mono">SECURITY_ANALYSIS</span></div>
          <p className="text-xs text-slate-300 leading-relaxed"><GlossaryText text={securityAnalysis} glossary={glossary} darkMode={true}/></p>
        </div>
        <div style={card}>
          <div className="flex items-center gap-2 mb-3"><AlertTriangle size={13} className="text-yellow-400"/><span className="text-xs text-yellow-400 tracking-wide font-mono">EDGE_CASES.CATALOG</span></div>
          <ul className="space-y-2">
            {edgeCases.map((ec,i)=>(
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400 font-mono">
                <span className="text-yellow-500 font-bold flex-shrink-0">[{String(i+1).padStart(2,"0")}]</span>{ec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {glossary.length > 0 && (
        <div style={card}>
          <div className="flex items-center gap-2 mb-3"><Braces size={13} className="text-cyan-400"/><span className="text-xs text-cyan-400 tracking-wide font-mono">TERM_GLOSSARY.MAP</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {glossary.map(({term,translation})=>(
              <div key={term} className="bg-black/40 rounded p-3" style={{border:"1px solid rgba(0,140,255,0.15)"}}>
                <code className="text-xs text-cyan-300 font-bold font-mono">{term}</code>
                <p className="text-xs text-slate-500 mt-1">{translation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function Specweaver() {
  const [viewMode, setViewMode]           = useState<ViewMode>("Boardroom");
  const [prompt, setPrompt]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [boardroomData, setBoardroomData] = useState<BoardroomData | null>(null);
  const [engineData, setEngineData]       = useState<EngineRoomData | null>(null);

  const handlePromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value), []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(null); setBoardroomData(null); setEngineData(null);
    try {
      const res  = await fetch("/api/weaver", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,viewMode})});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
      if (viewMode === "Boardroom") setBoardroomData(data);
      else setEngineData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [prompt, viewMode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
  }, [handleGenerate]);

  // ── BOARDROOM ──────────────────────────────────────────────────────────────
  if (viewMode === "Boardroom") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" style={{fontFamily:"'DM Sans','Helvetica Neue',sans-serif"}}>
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <SpecweaverLogo size={30}/>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">Specweaver</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Architecture Intelligence</p>
            </div>
          </div>
          <button onClick={()=>setViewMode("EngineRoom")} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs sm:text-sm text-slate-600 shadow-sm">
            <Terminal size={13} className="text-slate-400"/>
            <span className="hidden sm:inline">Engine Room</span>
            <ChevronRight size={12} className="text-slate-400"/>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12 text-center" style={{animation:"slideDown .5s ease both"}}>
          <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-2 sm:mb-3">Strategic Architecture Overview</p>
          <h2 className="text-3xl sm:text-5xl font-light text-slate-900 mb-3">The Boardroom</h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto">Transform your product vision into executive-ready architecture insights.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6 sm:mb-8">
          <label htmlFor="br-prompt" className="block text-sm font-medium text-slate-700 mb-3">Describe Your Product Vision</label>
          <textarea id="br-prompt" value={prompt} onChange={handlePromptChange} onKeyDown={handleKeyDown}
            placeholder="e.g. A healthcare platform where patients can book appointments, doctors can manage schedules..."
            rows={4} className="w-full text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"/>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <p className="text-xs text-slate-400">Board-ready output, no jargon</p>
            <WeaveButton loading={loading} disabled={loading||!prompt.trim()} onClick={handleGenerate}/>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3"><AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5"/><p className="text-sm text-red-700">{error}</p></div>}
        {loading && <div className="space-y-4 animate-pulse"><div className="grid grid-cols-3 gap-4">{[0,1,2].map(i=><div key={i} className="h-24 bg-slate-100 rounded-2xl"/>)}</div><div className="h-32 bg-slate-100 rounded-2xl"/><div className="h-48 bg-slate-100 rounded-2xl"/></div>}
        {boardroomData && !loading && <BoardroomOutput data={boardroomData}/>}
        {!boardroomData && !loading && <div className="text-center py-16 sm:py-24 text-slate-400"><Layers size={44} className="mx-auto mb-4 opacity-20"/><p className="text-sm">Enter your product vision above to generate your architecture overview.</p></div>}
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-5 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2"><SpecweaverLogo size={20}/><span className="text-sm font-semibold text-slate-700">Specweaver</span></div>
          <p className="text-xs text-slate-400">Part of the <a href="https://ba-copilot-mvp.vercel.app" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 transition-colors">BA Copilot</a> platform</p>
          <p className="text-xs text-slate-400">&copy; 2026 Specweaver. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes tipIn    { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes slideDown{ from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );

  // ── ENGINE ROOM ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-slate-300" style={{background:"#060a10",fontFamily:"'Fira Code','IBM Plex Mono',monospace"}}>
      {/* Page background grid */}
      <div aria-hidden style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.14) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.14) 1px,transparent 1px),linear-gradient(rgba(0,230,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.07) 1px,transparent 1px)",backgroundSize:"40px 40px,40px 40px,120px 120px,120px 120px",animation:"bgGridPulse 4s ease-in-out infinite"}}/>

      <header className="border-b border-cyan-900/50 bg-black/80 backdrop-blur-xl sticky top-0 z-40" style={{boxShadow:"0 1px 0 rgba(0,200,255,0.15)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div style={{filter:"drop-shadow(0 0 8px rgba(0,200,255,0.6))"}}>
              <SpecweaverLogo size={30} dark/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-cyan-300 tracking-widest font-mono">SPECWEAVER</span>
                <span className="hidden sm:inline text-xs text-green-400 bg-green-950/60 px-1.5 py-0.5 rounded border border-green-700/50 animate-pulse font-mono">ONLINE</span>
              </div>
              <p className="hidden sm:block text-xs text-cyan-700 font-mono">// Engine Room — Principal Architect Mode</p>
            </div>
          </div>
          <button onClick={()=>setViewMode("Boardroom")} className="flex items-center gap-1.5 px-3 py-2 border border-cyan-800/60 rounded text-xs text-cyan-400 hover:border-cyan-500 hover:bg-cyan-950/30 transition-all font-mono">
            <Layers size={13}/><span className="hidden sm:inline">Boardroom Mode</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10">
        <div className="mb-7 sm:mb-10" style={{animation:"slideDown .5s ease both"}}>
          <p className="text-xs text-cyan-500 tracking-widest uppercase mb-1.5 font-mono">// System Architecture Generator</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1.5" style={{textShadow:"0 0 40px rgba(0,200,255,0.6)"}}>The Engine Room</h2>
          <p className="text-xs sm:text-sm text-cyan-500/70 font-mono">Production-grade technical specifications. Zero ambiguity.</p>
        </div>

        <div className="relative mb-6 sm:mb-8" style={{padding:4}}>
          <AnimatedGrid/>
          <div className="relative z-10 rounded-xl p-4 sm:p-6" style={{background:"rgba(5,12,24,0.95)",backdropFilter:"blur(6px)"}}>
            <div className="flex items-center gap-2 mb-3"><Terminal size={13} className="text-cyan-400"/><span className="text-xs text-cyan-400 tracking-widest font-mono">SYSTEM_PROMPT.INPUT</span></div>
            <textarea id="er-prompt" value={prompt} onChange={handlePromptChange} onKeyDown={handleKeyDown}
              placeholder={"// Describe the system to architect...\n// e.g. Real-time collaborative doc editor with conflict resolution, offline support..."}
              rows={5}
              className="w-full text-xs text-green-300 bg-black/70 rounded p-4 resize-none outline-none transition-all font-mono leading-relaxed"
              style={{border:"1px solid rgba(0,180,255,0.35)",caretColor:"#22d3ee",boxShadow:"inset 0 0 20px rgba(0,0,0,0.6)"}}
              onFocus={e=>{e.currentTarget.style.borderColor="rgba(0,220,255,0.7)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="rgba(0,180,255,0.35)";}}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-800 font-mono">
                <span>MODE: <span className="text-cyan-400">ARCHITECT</span></span>
                <span>DEPTH: <span className="text-green-400">MAX</span></span>
              </div>
              <WeaveButton loading={loading} disabled={loading||!prompt.trim()} onClick={handleGenerate} dark/>
            </div>
          </div>
        </div>

        {error && <div className="rounded-xl p-4 mb-5 flex items-start gap-3" style={{background:"rgba(127,29,29,0.3)",border:"1px solid rgba(239,68,68,0.4)"}}><AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5"/><p className="text-xs text-red-300 font-mono break-words">[ERROR] {error}</p></div>}
        {loading && <div className="space-y-4">{[120,200,140,100].map((h,i)=><div key={i} className="rounded-xl" style={{height:h,border:"1px solid rgba(0,160,255,0.15)",background:"rgba(8,18,36,0.8)",animation:"skeletonPulse 1.6s " + (i*0.15) + "s ease-in-out infinite"}}/>)}</div>}
        {engineData && !loading && <EngineRoomOutput data={engineData}/>}
        {!engineData && !loading && <div className="text-center py-16 sm:py-24"><Cpu size={44} className="mx-auto mb-4" style={{color:"rgba(0,160,255,0.25)",filter:"drop-shadow(0 0 16px rgba(0,200,255,0.3))"}}/><p className="text-xs text-cyan-800 font-mono">// AWAITING INPUT — SYSTEM READY</p></div>}
      </main>

      <footer className="relative z-10" style={{borderTop:"1px solid rgba(0,200,255,0.12)",background:"rgba(3,8,18,0.95)"}}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div style={{filter:"drop-shadow(0 0 6px rgba(0,200,255,0.5))"}}>
              <SpecweaverLogo size={22} dark/>
            </div>
            <span className="text-sm font-bold text-cyan-300 tracking-widest font-mono">SPECWEAVER</span>
          </div>
          <p className="text-xs text-cyan-800 font-mono">Part of the <a href="https://ba-copilot-mvp.vercel.app" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-300 transition-colors">BA Copilot</a> platform</p>
          <p className="text-xs text-cyan-800 font-mono">&copy; 2026 Specweaver</p>
        </div>
      </footer>

      <style>{`
        @keyframes bgGridPulse  { 0%,100%{opacity:0.75} 50%{opacity:1} }
        @keyframes gridBreathe  { 0%,100%{opacity:0.7}  50%{opacity:1} }
        @keyframes scanH        { 0%{background-position:-60px 0}  100%{background-position:100% 0} }
        @keyframes scanV        { 0%{background-position:0 -80px} 100%{background-position:0 100%} }
        @keyframes borderPulse  { 0%,100%{box-shadow:0 0 18px rgba(0,210,255,0.55),inset 0 0 18px rgba(0,210,255,0.12)} 50%{box-shadow:0 0 38px rgba(0,230,255,0.95),inset 0 0 32px rgba(0,230,255,0.25)} }
        @keyframes cornerPulse  { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes dotPulse     { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.7} 50%{transform:translate(-50%,-50%) scale(1.5);opacity:1} }
        @keyframes slideDown    { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp     { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer      { from{left:-40%} to{left:140%} }
        @keyframes gradMove     { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes tipIn        { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes skeletonPulse{ 0%,100%{opacity:.25} 50%{opacity:.55} }
      `}</style>
    </div>
  );
}
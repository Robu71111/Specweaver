import { useState, useEffect } from "react";

// ── Custom Specweaver Logo ─────────────────────────────────────────────────────
function SpecweaverLogo({ size = 32, dark = false }) {
  const accent = dark ? "#60a5fa" : "#6366f1";
  const dim    = dark ? "rgba(96,165,250,0.45)" : "rgba(99,102,241,0.45)";
  const fill   = dark ? "rgba(96,165,250,0.07)" : "rgba(99,102,241,0.07)";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none"
      style={{ filter: dark ? "drop-shadow(0 0 5px rgba(96,165,250,0.75))" : "drop-shadow(0 1px 3px rgba(99,102,241,0.25))", flexShrink:0 }}>
      {/* Outer rotated square — the "weave" diamond */}
      <rect x="3.5" y="3.5" width="25" height="25" rx="3.5"
        stroke={accent} strokeWidth="1.5" fill={fill}
        transform="rotate(45 16 16)"/>
      {/* Inner rotated square */}
      <rect x="8.5" y="8.5" width="15" height="15" rx="2"
        stroke={dim} strokeWidth="1" fill="none"
        transform="rotate(45 16 16)"/>
      {/* Centre node */}
      <circle cx="16" cy="16" r="2.8" fill={accent}/>
      {/* Cardinal dots */}
      <circle cx="16" cy="4.5"  r="1.6" fill={accent} opacity="0.65"/>
      <circle cx="16" cy="27.5" r="1.6" fill={accent} opacity="0.65"/>
      <circle cx="4.5"  cy="16" r="1.6" fill={accent} opacity="0.65"/>
      <circle cx="27.5" cy="16" r="1.6" fill={accent} opacity="0.65"/>
      {/* Circuit traces */}
      <line x1="16" y1="6.2"  x2="16" y2="13.2" stroke={dim} strokeWidth="1.1"/>
      <line x1="16" y1="18.8" x2="16" y2="25.8" stroke={dim} strokeWidth="1.1"/>
      <line x1="6.2"  y1="16" x2="13.2" y2="16" stroke={dim} strokeWidth="1.1"/>
      <line x1="18.8" y1="16" x2="25.8" y2="16" stroke={dim} strokeWidth="1.1"/>
    </svg>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const I = ({ d, s=14, col, style={} }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col||"currentColor"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0,...style }}>
    {Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}
  </svg>
);
const P = {
  Terminal:     "M4 17l6-6-6-6M12 19h8",
  Layers:       "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  Clock:        ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 6v6l4 2"],
  TrendingUp:   "M23 6l-9.5 9.5-5-5L1 18",
  Shield:       "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  Users:        ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75","M9 11a4 4 0 100-8 4 4 0 000 8z"],
  Download:     ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  Database:     ["M12 2a9 3 0 019 3c0 1.657-4.03 3-9 3s-9-1.343-9-3 4.03-3 9-3z","M3 5c0 1.657 4.03 3 9 3s9-1.343 9-3","M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5","M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"],
  GitBranch:    ["M6 3v12","M18 9a3 3 0 100-6 3 3 0 000 6z","M6 21a3 3 0 100-6 3 3 0 000 6z","M15 6a9 9 0 01-9 9"],
  AlertTri:     ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"],
  Copy:         ["M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2z","M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"],
  Check:        "M20 6L9 17l-5-5",
  Braces:       "M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5c0 1.1.9 2 2 2h1M16 21h1a2 2 0 002-2v-5c0-1.1.9-2 2-2a2 2 0 01-2-2V5a2 2 0 00-2-2h-1",
  FileCode:     ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M10 13l-2 2 2 2","M14 17l2-2-2-2"],
  Network:      "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  Sparkles:     ["M12 3l1.88 5.76a1 1 0 00.95.69H21l-4.94 3.59a1 1 0 00-.36 1.12L17.59 20 12 16.41 6.41 20l1.89-5.84a1 1 0 00-.36-1.12L3 9.45h6.17a1 1 0 00.95-.69L12 3z"],
  ChevRight:    "M9 18l6-6-6-6",
};

// ── Sample data ───────────────────────────────────────────────────────────────
const BR = {
  summary:{ buildTime:"10–14 weeks", resourceComplexity:"Medium · 6 engineers", securityRating:"Enterprise ★★★★★" },
  overview:"This platform unifies patient booking, provider scheduling, and multi-clinic analytics into a single digital experience. By adopting a Microservices architecture, each business function evolves independently — your engineering team can update the booking flow without touching billing or analytics. The system scales automatically during peak hours so patients never experience slowdowns, and clinic administrators get a real-time command centre across all 50+ locations.",
  keyBenefits:[
    "Reduce appointment no-shows by up to 34% through automated SMS & email reminders",
    "Cut administrative overhead by 60% with AI-assisted schedule optimisation",
    "Sub-200ms page loads globally via CDN edge caching — patients stay engaged",
    "HIPAA-compliant data handling protects patient trust and avoids regulatory fines",
    "Single dashboard gives leadership instant visibility across all clinic locations",
  ],
  glossary:[
    { term:"Microservices", translation:"Instead of one giant app, the system is split into specialised mini-apps that each do one job extremely well — like different departments in a company." },
    { term:"CDN",           translation:"A network of servers around the world so patients always load pages from a server close to them — like having a local branch in every city." },
    { term:"API Gateway",   translation:"The single front door of your platform — every request enters here and gets directed to the right service." },
    { term:"HIPAA",         translation:"US federal rules requiring healthcare platforms to keep patient data private and secure, with heavy fines for breaches." },
    { term:"Load Balancer", translation:"A smart traffic director that spreads users across multiple servers — like opening extra checkout lanes when a supermarket gets busy." },
  ],
  executiveInsights:"The telemedicine market is projected to reach $380B by 2030. Moving quickly to establish a reliable, scalable platform now creates a defensible moat — patients and clinics are highly sticky once integrated. The primary risk is data-migration complexity from legacy EMR systems; budget 3 weeks of engineering time for this phase. Recommend a phased rollout: 5 pilot clinics in month one, full fleet by month four.",
};

const ER = {
  technicalOverview:"The system employs an event-driven Microservices topology with an API Gateway (Kong) as the single ingress point. Services communicate asynchronously via Apache Kafka for audit-trail durability and synchronously via gRPC for latency-sensitive paths (booking availability < 50ms p99). PostgreSQL with read replicas handles transactional workloads; TimescaleDB for analytics time-series. Redis Cluster provides distributed session store and appointment-slot locking to prevent double-booking race conditions under concurrent Load Balancer traffic.",
  sqlSchema:`-- Tenants (multi-clinic support)
CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  subdomain   VARCHAR(63)  NOT NULL UNIQUE,
  plan        VARCHAR(32)  NOT NULL DEFAULT 'standard',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
-- Patients
CREATE TABLE patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(32),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);
CREATE INDEX idx_patients_tenant ON patients(tenant_id);
-- Appointments
CREATE TABLE appointments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID NOT NULL REFERENCES patients(id),
  provider_id  UUID NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  status       VARCHAR(32) NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled','confirmed','cancelled','completed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_appt_tenant_time ON appointments(tenant_id, starts_at);`,
  apiSpec:[
    { method:"GET",    path:"/api/v1/appointments",     desc:"List appointments",
      res:{ data:[{ id:"uuid", startsAt:"2025-03-01T09:00Z", status:"scheduled" }], meta:{ total:142,page:1 } } },
    { method:"POST",   path:"/api/v1/appointments",     desc:"Book appointment",
      req:{ patientId:"uuid", providerId:"uuid", startsAt:"2025-03-01T09:00Z", durationMins:30 },
      res:{ id:"uuid", status:"confirmed", confirmationCode:"HC-8821" } },
    { method:"DELETE", path:"/api/v1/appointments/:id", desc:"Cancel appointment",
      res:{ id:"uuid", status:"cancelled", cancelledAt:"2025-02-27T14:22Z" } },
  ],
  glossary:[
    { term:"Kafka",       translation:"A high-throughput message bus to decouple services and guarantee event delivery even during partial failures." },
    { term:"gRPC",        translation:"A high-performance RPC framework — roughly 5–10x faster than REST for internal service calls." },
    { term:"TimescaleDB", translation:"PostgreSQL extension optimised for time-series data; ideal for clinic analytics dashboards." },
    { term:"Redis",       translation:"An ultra-fast in-memory data store used for caching, session management, and distributed locks." },
  ],
  securityAnalysis:"Auth uses OAuth 2.0 + PKCE with short-lived JWTs (15min expiry) and Kafka-backed refresh token rotation. All PII fields encrypted at rest (AES-256, per-tenant KMS keys). Rate limiting at the API Gateway layer mitigates credential-stuffing. SQL injection eliminated via parameterised queries; XSS mitigated by strict CSP headers and output encoding at the Redis cache layer.",
  edgeCases:[
    "Double-booking race condition — mitigated by Redis distributed lock (TTL: 10s)",
    "Provider cancels < 2h before start — compensating notification via Kafka dead-letter queue",
    "Kafka consumer lag spike — circuit breaker activates, falls back to synchronous gRPC path",
    "JWT theft — refresh token rotation invalidates entire family on reuse (RFC 6819)",
    "Cross-tenant data leak — Row-Level Security enforced at PostgreSQL layer",
    "TimescaleDB chunk bloat — retention policy compresses chunks older than 90 days",
  ],
};

// ── Shared CSS ────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=DM+Serif+Display:ital@0;1&family=Fira+Code:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeInUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown  { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse  {
    0%,100% { box-shadow: 0 0 16px rgba(59,130,246,.32), inset 0 0 16px rgba(59,130,246,.07); }
    50%     { box-shadow: 0 0 36px rgba(59,130,246,.68), inset 0 0 26px rgba(59,130,246,.14); }
  }
  @keyframes weaving { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
  @keyframes tipIn   { from{opacity:0;transform:translateX(-50%) translateY(5px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.35} }

  .anim-fadeInUp  { animation: fadeInUp  .45s ease-out both; }
  .anim-slideDown { animation: slideDown .40s ease-out both; }
  .glow-border    { animation: glowPulse 3s ease-in-out infinite; }
  .pulse          { animation: pulse 2s ease-in-out infinite; }

  .card-lift { transition: transform .2s ease, box-shadow .2s ease; }
  .card-lift:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -12px rgba(99,102,241,.2); }

  .cyber-card {
    border: 1px solid rgba(59,130,246,.22);
    background: rgba(7,7,20,.88);
    backdrop-filter: blur(14px);
  }

  /* ─ GRID: bright blue lines matching the Weave Spec button blue (#2563eb) ─ */
  .er-bg {
    background-color: #06060f;
    min-height: 100vh;
    position: relative;
    color: #94a3b8;
    font-family: 'Fira Code','Courier New',monospace;
  }
  /* Fixed grid layer — sits behind everything */
  .er-bg::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(37,99,235,.22) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,.22) 1px, transparent 1px);
    background-size: 42px 42px;
  }
  /* Radial vignette — darkens edges so grid doesn't compete with cards */
  .er-bg::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 75% 70% at 50% 30%, transparent 35%, rgba(6,6,15,.82) 100%);
  }
  /* All real content sits above the grid layers */
  .er-content { position: relative; z-index: 1; }

  .method-get    { color: #34d399; }
  .method-post   { color: #60a5fa; }
  .method-put    { color: #fbbf24; }
  .method-delete { color: #f87171; }
  .method-patch  { color: #c084fc; }

  .btn-weave-anim {
    background: linear-gradient(270deg,#4f46e5,#7c3aed,#2563eb,#4f46e5);
    background-size: 300% 300%;
    animation: weaving 1.8s ease infinite;
  }

  pre { white-space:pre-wrap; word-break:break-word; }
`;

// ── GlossaryTerm ──────────────────────────────────────────────────────────────
function GT({ term, translation, dark }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position:"relative", display:"inline" }}>
      <span onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} style={{
        borderBottom:`2px dotted ${dark?"#60a5fa":"#6366f1"}`, cursor:"help",
        color: dark?"#93c5fd":"#4338ca",
      }}>{term}</span>
      {show && (
        <span style={{
          position:"absolute", bottom:"calc(100% + 8px)", left:"50%",
          transform:"translateX(-50%)", width:242, zIndex:99,
          background: dark?"rgba(10,16,60,0.98)":"white",
          border:`1px solid ${dark?"rgba(96,165,250,0.5)":"#c7d2fe"}`,
          borderRadius:10, padding:"10px 13px", fontSize:11, lineHeight:1.5,
          color: dark?"#bfdbfe":"#374151",
          boxShadow: dark?"0 8px 36px rgba(37,99,235,0.4)":"0 8px 36px rgba(0,0,0,0.13)",
          animation:"tipIn .15s ease-out both", pointerEvents:"none",
        }}>
          <span style={{ display:"block", fontWeight:700, marginBottom:4, color:dark?"#93c5fd":"#4f46e5" }}>💡 Plain English</span>
          {translation}
          <span style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)",
            borderWidth:5, borderStyle:"solid",
            borderColor:`${dark?"rgba(10,16,60,0.98)":"white"} transparent transparent transparent` }}/>
        </span>
      )}
    </span>
  );
}
function GlossText({ text, glossary, dark }) {
  if (!glossary?.length) return <span>{text}</span>;
  const map = Object.fromEntries(glossary.map(g=>[g.term.toLowerCase(),g]));
  const parts = text.split(new RegExp(`\\b(${glossary.map(g=>g.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})\\b`,"gi"));
  return <>{parts.map((p,i)=>{ const g=map[p.toLowerCase()]; return g?<GT key={i} term={p} translation={g.translation} dark={dark}/>:<span key={i}>{p}</span>; })}</>;
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function useTW(text, speed=4) {
  const [shown, setShown] = useState("");
  const [done,  setDone]  = useState(false);
  useEffect(()=>{
    setShown(""); setDone(false);
    if (!text) return;
    let i=0;
    const t=setInterval(()=>{ setShown(text.slice(0,++i)); if(i>=text.length){setDone(true);clearInterval(t);} },speed);
    return()=>clearInterval(t);
  },[text]);
  return{shown,done};
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={()=>{ navigator.clipboard?.writeText(text); setOk(true); setTimeout(()=>setOk(false),2000); }}
      style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,padding:"3px 10px",borderRadius:6,cursor:"pointer",
        border:"1px solid rgba(30,58,138,0.8)", background:"rgba(30,58,138,0.28)", color:"#93c5fd" }}>
      <I d={P[ok?"Check":"Copy"]} s={11}/>{ok?"Copied":"Copy"}
    </button>
  );
}

// ── WeaveButton ───────────────────────────────────────────────────────────────
function WeaveBtn({ dark=false }) {
  return (
    <button style={{ display:"flex",alignItems:"center",gap:7,padding:dark?"9px 20px":"10px 22px",
      borderRadius:dark?6:12, border:"none", cursor:"pointer", position:"relative", overflow:"hidden",
      fontWeight:700, fontSize:13, color:"white", letterSpacing:dark?"0.08em":"0",
      fontFamily:dark?"'Fira Code',monospace":"'DM Sans',sans-serif",
      background:dark?"#2563eb":"#0f172a",
      boxShadow:dark?"0 0 22px rgba(37,99,235,0.65)":"0 4px 22px rgba(15,23,42,0.35)",
    }}>
      <I d={P.Sparkles} s={14}/>
      {dark?"WEAVE SPEC":"Weave Architecture"}
    </button>
  );
}

// ── SVG diagrams ──────────────────────────────────────────────────────────────
function DiagramBR() {
  return (
    <div style={{ background:"rgba(248,250,255,0.85)", border:"1px solid #dde5ff", borderRadius:13, padding:"14px 10px" }}>
      <svg viewBox="0 0 780 148" style={{ width:"100%" }}>
        <defs><marker id="ab" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3z" fill="#a5b4fc"/></marker></defs>
        {[[118,73,226,73],[336,56,396,42],[336,90,396,106],[506,42,572,60],[506,106,572,90]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#ab)"/>
        ))}
        {[
          {x:8,  y:49,w:110,l:"Patients & Doctors",s:"End Users",     bg:"#eef2ff",b:"#6366f1"},
          {x:226,y:49,w:110,l:"API Gateway",        s:"Kong / AWS",   bg:"#f0fdf4",b:"#22c55e"},
          {x:396,y:20,w:110,l:"Booking Service",    s:"Scheduling",   bg:"#fff7ed",b:"#f97316"},
          {x:396,y:90,w:110,l:"Analytics Svc",      s:"Reporting",    bg:"#fdf4ff",b:"#a855f7"},
          {x:572,y:26,w:108,l:"PostgreSQL",          s:"Primary DB",  bg:"#f0f9ff",b:"#0ea5e9"},
          {x:572,y:90,w:108,l:"Redis Cache",         s:"Session/Lock",bg:"#fefce8",b:"#eab308"},
        ].map(n=>(
          <g key={n.l}>
            <rect x={n.x} y={n.y} width={n.w} height={48} rx={9} fill={n.bg} stroke={n.b} strokeWidth="1.5"/>
            <text x={n.x+n.w/2} y={n.y+19} textAnchor="middle" fontSize="10.5" fill="#1e293b" fontFamily="DM Sans,sans-serif" fontWeight="700">{n.l}</text>
            <text x={n.x+n.w/2} y={n.y+34} textAnchor="middle" fontSize="9"    fill="#94a3b8" fontFamily="DM Sans,sans-serif">{n.s}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DiagramER() {
  const layers=[
    {label:"EDGE",    nodes:["CDN / WAF","Load Balancer"],            b:"#3b82f6",bg:"rgba(29,78,216,.2)"},
    {label:"API",     nodes:["API Gateway","Auth Service"],           b:"#22c55e",bg:"rgba(21,128,61,.2)"},
    {label:"SERVICES",nodes:["Booking Svc","Analytics Svc","Notify"],b:"#f97316",bg:"rgba(194,65,12,.2)"},
    {label:"DATA",    nodes:["PostgreSQL","Redis","Kafka"],           b:"#8b5cf6",bg:"rgba(109,40,217,.2)"},
  ];
  return (
    <div style={{ background:"rgba(0,0,0,0.5)", border:"1px solid rgba(59,130,246,0.38)", borderRadius:12, padding:"12px 10px",
      boxShadow:"0 0 24px rgba(59,130,246,.22)" }}>
      <svg viewBox="0 0 760 188" style={{ width:"100%", minWidth:500 }}>
        <defs>
          <marker id="ae" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3z" fill="#3b82f6"/></marker>
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {[177,369,561].map(x=><line key={x} x1={x} y1={93} x2={x+17} y2={93} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#ae)" opacity="0.85"/>)}
        {layers.map((l,li)=>{
          const x=8+li*188;
          return (
            <g key={l.label}>
              <rect x={x} y={4} width={166} height={180} rx={9} fill={l.bg} stroke={l.b} strokeWidth="1" strokeDasharray="5,3" opacity="0.75"/>
              <text x={x+83} y={20} textAnchor="middle" fontSize="7.5" fill={l.b} fontFamily="Fira Code,monospace" letterSpacing="2.5" fontWeight="800">{l.label}</text>
              {l.nodes.map((n,ni)=>(
                <g key={n} filter="url(#glow)">
                  <rect x={x+10} y={27+ni*50} width={146} height={36} rx={7} fill="rgba(4,4,18,.92)" stroke={l.b} strokeWidth="1.2"/>
                  <text x={x+83} y={27+ni*50+22} textAnchor="middle" fontSize="10.5" fill="#e2e8f0" fontFamily="Fira Code,monospace" fontWeight="600">{n}</text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── BOARDROOM ─────────────────────────────────────────────────────────────────
function Boardroom({ onSwitch }) {
  const d=BR;
  return (
    <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif", background:"linear-gradient(140deg,#f8faff 0%,#fff 55%,#f0f4ff 100%)", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ position:"sticky",top:0,zIndex:40,background:"rgba(255,255,255,0.78)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(226,232,240,0.85)",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <SpecweaverLogo size={32} dark={false}/>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:"#0f172a",letterSpacing:"0.02em" }}>Specweaver</div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>Architecture Intelligence</div>
          </div>
        </div>
        <button onClick={onSwitch} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,border:"1px solid #e2e8f0",background:"white",fontSize:12,color:"#475569",cursor:"pointer",fontWeight:600 }}>
          <I d={P.Terminal} s={13} col="#94a3b8"/> Engine Room <I d={P.ChevRight} s={12} col="#94a3b8"/>
        </button>
      </div>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"40px 24px" }}>
        {/* Hero */}
        <div className="anim-slideDown" style={{ textAlign:"center",marginBottom:36 }}>
          <div style={{ fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6366f1",fontFamily:"'Fira Code',monospace",marginBottom:8 }}>Strategic Architecture Overview</div>
          <h1 style={{ fontSize:48,fontWeight:300,fontFamily:"'DM Serif Display',serif",margin:"0 0 10px",color:"#0f172a",letterSpacing:"-0.02em" }}>The Boardroom</h1>
          <p style={{ color:"#64748b",fontSize:15,maxWidth:480,margin:"0 auto" }}>Healthcare appointment platform · Executive architecture overview</p>
        </div>

        {/* Input */}
        <div style={{ background:"white",border:"1px solid #e2e8f0",borderRadius:20,padding:"22px 24px",marginBottom:28,boxShadow:"0 1px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize:13,fontWeight:600,color:"#334155",marginBottom:10 }}>Describe Your Product Vision</div>
          <div style={{ background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,padding:"14px 16px",minHeight:80,fontSize:13,color:"#94a3b8",lineHeight:1.6 }}>
            e.g. A healthcare platform where patients can book appointments, doctors can manage schedules, and administrators view analytics across 50+ clinics…
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14 }}>
            <span style={{ fontSize:11,color:"#94a3b8" }}>Board-ready output, no jargon · <code style={{ background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:4,padding:"1px 5px",fontSize:10 }}>⌘ Enter</code></span>
            <WeaveBtn/>
          </div>
        </div>

        <div className="anim-fadeInUp">
          {/* Summary cards */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20 }}>
            {[
              {ic:"Clock",     lbl:"Est. Build Time",    val:d.summary.buildTime,         bg:"linear-gradient(135deg,#eff6ff,#eef2ff)",b:"#c7d2fe",c:"#4338ca"},
              {ic:"TrendingUp",lbl:"Resource Complexity",val:d.summary.resourceComplexity,bg:"linear-gradient(135deg,#f5f3ff,#faf5ff)",b:"#ddd6fe",c:"#6d28d9"},
              {ic:"Shield",    lbl:"Security Rating",    val:d.summary.securityRating,    bg:"linear-gradient(135deg,#ecfdf5,#f0fdf4)",b:"#bbf7d0",c:"#065f46"},
            ].map(c=>(
              <div key={c.lbl} className="card-lift" style={{ background:c.bg,border:`1px solid ${c.b}`,borderRadius:18,padding:"18px 20px" }}>
                <I d={P[c.ic]} s={17} col={c.c} style={{ marginBottom:8 }}/>
                <div style={{ fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:"#94a3b8",fontFamily:"'Fira Code',monospace",marginBottom:4 }}>{c.lbl}</div>
                <div style={{ fontSize:20,fontWeight:700,color:c.c }}>{c.val}</div>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div style={{ background:"white",border:"1px solid #e2e8f0",borderRadius:20,padding:"26px 28px",marginBottom:18,boxShadow:"0 1px 12px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,fontWeight:400,marginTop:0,marginBottom:12,color:"#0f172a" }}>Strategic Overview</h3>
            <p style={{ lineHeight:1.75,fontSize:13.5,color:"#475569",margin:0 }}><GlossText text={d.overview} glossary={d.glossary} dark={false}/></p>
          </div>

          {/* Benefits + Translator */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18 }}>
            <div style={{ background:"white",border:"1px solid #e2e8f0",borderRadius:20,padding:"22px 24px",boxShadow:"0 1px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}><I d={P.Users} s={14} col="#6366f1"/><span style={{ fontSize:13,fontWeight:700,color:"#1e293b" }}>Business Outcomes</span></div>
              {d.keyBenefits.map((b,i)=>(
                <div key={i} style={{ display:"flex",gap:10,marginBottom:10 }}>
                  <span style={{ minWidth:22,height:22,background:"#eef2ff",color:"#4338ca",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,fontFamily:"monospace",flexShrink:0,marginTop:1 }}>{i+1}</span>
                  <span style={{ fontSize:12.5,color:"#475569",lineHeight:1.6 }}><GlossText text={b} glossary={d.glossary} dark={false}/></span>
                </div>
              ))}
            </div>
            <div style={{ background:"linear-gradient(135deg,#eef2ff,#f5f3ff)",border:"1px solid #c7d2fe",borderRadius:20,padding:"22px 24px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}><I d={P.Braces} s={14} col="#6366f1"/><span style={{ fontSize:13,fontWeight:700,color:"#1e293b" }}>Executive Translator</span></div>
              <p style={{ fontSize:11,color:"#94a3b8",marginBottom:14 }}>Hover any <span style={{ borderBottom:"2px dotted #6366f1",color:"#4338ca" }}>underlined term</span> for plain-English.</p>
              {d.glossary.slice(0,4).map(({term,translation})=>(
                <div key={term} style={{ background:"rgba(255,255,255,0.78)",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"1px solid rgba(199,210,254,0.5)" }}>
                  <div style={{ fontSize:11,fontWeight:700,color:"#4338ca",marginBottom:2,fontFamily:"'Fira Code',monospace" }}>{term}</div>
                  <div style={{ fontSize:11,color:"#64748b",lineHeight:1.5 }}>{translation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagram */}
          <div style={{ background:"white",border:"1px solid #e2e8f0",borderRadius:20,padding:"22px 24px",marginBottom:18,boxShadow:"0 1px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}><I d={P.Network} s={14} col="#6366f1"/><span style={{ fontSize:13,fontWeight:700,color:"#1e293b" }}>System Architecture</span></div>
              <span style={{ fontSize:10,background:"#f8fafc",border:"1px solid #e2e8f0",padding:"3px 10px",borderRadius:6,color:"#94a3b8",fontFamily:"'Fira Code',monospace" }}>High-Level View</span>
            </div>
            <DiagramBR/>
          </div>

          {/* Insights */}
          <div style={{ background:"#0f172a",borderRadius:20,padding:"26px 28px",marginBottom:18 }}>
            <div style={{ fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#475569",fontFamily:"'Fira Code',monospace",marginBottom:8 }}>Executive Insights</div>
            <p style={{ fontSize:13.5,color:"#94a3b8",lineHeight:1.75,margin:0 }}><GlossText text={d.executiveInsights} glossary={d.glossary} dark={true}/></p>
          </div>

          <div style={{ display:"flex",justifyContent:"flex-end" }}>
            <button style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 18px",border:"1px solid #e2e8f0",borderRadius:12,background:"white",fontSize:12,color:"#64748b",cursor:"pointer" }}
              onClick={()=>alert("PDF Export — connect jsPDF in production")}>
              <I d={P.Download} s={13}/> Export as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ENGINE ROOM ───────────────────────────────────────────────────────────────
function EngineRoom({ onSwitch }) {
  const d=ER;
  const{shown,done}=useTW(d.technicalOverview,4);
  return (
    <div className="er-bg">
      <div className="er-content">
        {/* Header */}
        <div style={{ position:"sticky",top:0,zIndex:40,background:"rgba(3,3,14,.9)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(59,130,246,0.28)",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 0 rgba(59,130,246,.22)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <SpecweaverLogo size={32} dark={true}/>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:13,fontWeight:700,color:"#93c5fd",letterSpacing:"0.12em" }}>SPECWEAVER</span>
                <span className="pulse" style={{ fontSize:10,color:"#4ade80",background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.3)",padding:"2px 8px",borderRadius:4 }}>● ONLINE</span>
              </div>
              <div style={{ fontSize:10,color:"#1d4ed8" }}>// Engine Room — Principal Architect Mode</div>
            </div>
          </div>
          <button onClick={onSwitch} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 16px",border:"1px solid rgba(59,130,246,.38)",borderRadius:6,background:"transparent",color:"#60a5fa",fontSize:11,cursor:"pointer",fontFamily:"'Fira Code',monospace" }}>
            <SpecweaverLogo size={14} dark={true}/> Boardroom Mode
          </button>
        </div>

        <div style={{ maxWidth:980,margin:"0 auto",padding:"32px 20px" }}>
          <div className="anim-slideDown" style={{ marginBottom:28 }}>
            <div style={{ fontSize:10,color:"#1e40af",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6 }}>// System Architecture Generator</div>
            <h1 style={{ fontSize:40,fontWeight:800,color:"white",margin:"0 0 6px",letterSpacing:"-0.02em",textShadow:"0 0 40px rgba(59,130,246,.6),0 0 80px rgba(59,130,246,.2)" }}>The Engine Room</h1>
            <p style={{ fontSize:12,color:"rgba(96,165,250,.72)",margin:0 }}>Production-grade technical specifications. Zero ambiguity.</p>
          </div>

          {/* Input */}
          <div className="cyber-card glow-border" style={{ borderRadius:12,padding:"20px 22px",marginBottom:24 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><I d={P.Terminal} s={13} col="#60a5fa"/><span style={{ fontSize:10,color:"#60a5fa",letterSpacing:"0.1em" }}>SYSTEM_PROMPT.INPUT</span></div>
            <div style={{ background:"rgba(0,0,0,0.6)",border:"1px solid rgba(59,130,246,.22)",borderRadius:7,padding:"14px 16px",minHeight:86,fontSize:11,color:"rgba(134,239,172,.88)",lineHeight:1.7 }}>
              <span style={{ color:"rgba(30,64,175,.9)" }}>// Describe the system to architect...</span><br/>
              <span style={{ color:"rgba(30,64,175,.9)" }}>// e.g. Real-time collaborative doc editor with conflict resolution, offline support, multi-tenant arch...</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14 }}>
              <div style={{ display:"flex",gap:18,fontSize:11,color:"#1e3a8a" }}>
                <span>MODE: <span style={{ color:"#60a5fa" }}>ARCHITECT</span></span>
                <span>DEPTH: <span style={{ color:"#4ade80" }}>MAX</span></span>
                <span>⌘↵ execute</span>
              </div>
              <WeaveBtn dark/>
            </div>
          </div>

          <div className="anim-fadeInUp" style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {/* Overview */}
            <div className="cyber-card" style={{ borderRadius:12,padding:"18px 20px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><I d={P.FileCode} s={13} col="#60a5fa"/><span style={{ fontSize:10,color:"#60a5fa",letterSpacing:"0.1em" }}>TECHNICAL_OVERVIEW</span></div>
              <p style={{ fontSize:11.5,lineHeight:1.8,color:"#cbd5e1",margin:0 }}>{shown}{!done&&<span className="pulse" style={{ color:"#60a5fa" }}>▋</span>}</p>
            </div>

            {/* Diagram */}
            <div className="cyber-card" style={{ borderRadius:12,padding:"18px 20px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><I d={P.Network} s={13} col="#60a5fa"/><span style={{ fontSize:10,color:"#60a5fa",letterSpacing:"0.1em" }}>SYSTEM_ARCHITECTURE.FLOWCHART</span></div>
              <DiagramER/>
            </div>

            {/* SQL */}
            <div className="cyber-card" style={{ borderRadius:12,padding:"18px 20px" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><I d={P.Database} s={13} col="#60a5fa"/><span style={{ fontSize:10,color:"#60a5fa",letterSpacing:"0.1em" }}>DATABASE_SCHEMA.DDL</span></div>
                <CopyBtn text={d.sqlSchema}/>
              </div>
              <pre style={{ fontSize:11,color:"rgba(134,239,172,.9)",background:"rgba(0,0,0,.58)",borderRadius:8,padding:"14px 16px",overflow:"auto",border:"1px solid rgba(34,197,94,.18)",margin:0,lineHeight:1.65 }}>{d.sqlSchema}</pre>
            </div>

            {/* API */}
            <div className="cyber-card" style={{ borderRadius:12,padding:"18px 20px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><I d={P.GitBranch} s={13} col="#60a5fa"/><span style={{ fontSize:10,color:"#60a5fa",letterSpacing:"0.1em" }}>API_SPECIFICATION.REST</span></div>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {d.apiSpec.map((ep,i)=>(
                  <div key={i} style={{ background:"rgba(0,0,0,.48)",border:"1px solid rgba(59,130,246,.22)",borderRadius:9,padding:"14px 16px" }}>
                    <div style={{ display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,marginBottom:10 }}>
                      <span className={`method-${ep.method.toLowerCase()}`} style={{ fontSize:11,fontWeight:800,letterSpacing:"0.08em" }}>{ep.method}</span>
                      <code style={{ fontSize:11,background:"rgba(255,255,255,.05)",padding:"2px 8px",borderRadius:5,color:"white" }}>{ep.path}</code>
                      <span style={{ fontSize:10,color:"#475569",marginLeft:"auto" }}>{ep.desc}</span>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:ep.req?"1fr 1fr":"1fr",gap:10 }}>
                      {ep.req&&<div><div style={{ fontSize:10,color:"#1d4ed8",marginBottom:4 }}>// Request Body</div><pre style={{ fontSize:10,color:"#94a3b8",background:"rgba(0,0,0,.4)",padding:10,borderRadius:6,margin:0,border:"1px solid #1e293b" }}>{JSON.stringify(ep.req,null,2)}</pre></div>}
                      <div><div style={{ fontSize:10,color:"#1d4ed8",marginBottom:4 }}>// Response</div><pre style={{ fontSize:10,color:"rgba(74,222,128,.85)",background:"rgba(0,0,0,.4)",padding:10,borderRadius:6,margin:0,border:"1px solid #1e293b" }}>{JSON.stringify(ep.res,null,2)}</pre></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security + Edge Cases */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <div className="cyber-card" style={{ borderRadius:12,padding:"18px 20px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><I d={P.Shield} s={13} col="#60a5fa"/><span style={{ fontSize:10,color:"#60a5fa",letterSpacing:"0.1em" }}>SECURITY_ANALYSIS</span></div>
                <p style={{ fontSize:11.5,color:"#cbd5e1",lineHeight:1.75,margin:0 }}><GlossText text={d.securityAnalysis} glossary={d.glossary} dark/></p>
              </div>
              <div className="cyber-card" style={{ borderRadius:12,padding:"18px 20px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><I d={P.AlertTri} s={13} col="#f59e0b"/><span style={{ fontSize:10,color:"rgba(245,158,11,.88)",letterSpacing:"0.1em" }}>EDGE_CASES.CATALOG</span></div>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {d.edgeCases.map((ec,i)=>(
                    <div key={i} style={{ display:"flex",gap:8,fontSize:11,color:"#94a3b8",lineHeight:1.55 }}>
                      <span style={{ color:"#d97706",fontWeight:800,flexShrink:0 }}>[{String(i+1).padStart(2,"0")}]</span>{ec}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Glossary */}
            <div className="cyber-card" style={{ borderRadius:12,padding:"18px 20px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><I d={P.Braces} s={13} col="#60a5fa"/><span style={{ fontSize:10,color:"#60a5fa",letterSpacing:"0.1em" }}>TERM_GLOSSARY.MAP</span></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {d.glossary.map(({term,translation})=>(
                  <div key={term} style={{ background:"rgba(0,0,0,.42)",border:"1px solid rgba(59,130,246,.2)",borderRadius:8,padding:"10px 12px" }}>
                    <code style={{ fontSize:11,color:"#93c5fd",fontWeight:700 }}>{term}</code>
                    <p style={{ fontSize:10.5,color:"#475569",margin:"4px 0 0",lineHeight:1.5 }}>{translation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("EngineRoom");
  return (
    <>
      <style>{CSS}</style>

      {/* Floating mode toggle */}
      <div style={{
        position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:9999,
        background:mode==="Boardroom"?"rgba(255,255,255,0.95)":"rgba(3,3,15,0.95)",
        border:mode==="Boardroom"?"1px solid #e2e8f0":"1px solid rgba(59,130,246,0.48)",
        borderRadius:40,padding:"5px 6px",display:"flex",gap:4,
        boxShadow:mode==="Boardroom"?"0 8px 32px rgba(0,0,0,0.1)":"0 0 32px rgba(37,99,235,0.35)",
        backdropFilter:"blur(20px)",
      }}>
        {[
          {key:"Boardroom", label:"⬡  Boardroom",  font:"'DM Sans',sans-serif",    active:"#0f172a"},
          {key:"EngineRoom",label:"⌨  Engine Room", font:"'Fira Code',monospace",   active:"#2563eb"},
        ].map(m=>(
          <button key={m.key} onClick={()=>setMode(m.key)} style={{
            padding:"8px 20px",borderRadius:36,border:"none",cursor:"pointer",fontFamily:m.font,
            background:mode===m.key?m.active:"transparent",
            color:mode===m.key?"white":(mode==="Boardroom"?"#94a3b8":"#374151"),
            fontSize:12,fontWeight:700,transition:"all .22s ease",
            boxShadow:mode===m.key&&m.key==="EngineRoom"?"0 0 16px rgba(37,99,235,.6)":"none",
          }}>{m.label}</button>
        ))}
      </div>

      {mode==="Boardroom" ? <Boardroom onSwitch={()=>setMode("EngineRoom")}/> : <EngineRoom onSwitch={()=>setMode("Boardroom")}/>}
    </>
  );
}

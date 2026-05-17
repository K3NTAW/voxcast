// components.jsx — Relay design system primitives + app-specific components.
// Loaded after React/Babel; before app.jsx and page files.

// ────────────────────────────────────────────────────────────────
// Icon — minimal Lucide-style SVG icons, stroke 1.75.
// ────────────────────────────────────────────────────────────────
const ICON_PATHS = {
  // Nav
  layoutDashboard: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
  sliders: <><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  key: <><circle cx="7.5" cy="15.5" r="3.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></>,
  link2: <><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 15 14"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  // UI
  chevronRight: <polyline points="9 18 15 12 9 6"/>,
  chevronDown: <polyline points="6 9 12 15 18 9"/>,
  chevronLeft: <polyline points="15 18 9 12 15 6"/>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
  arrowUpRight: <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  check: <polyline points="20 6 9 17 4 12"/>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  search: <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  // App
  mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="17" x2="12" y2="22"/></>,
  micOff: <><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7 7 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" y1="19" x2="12" y2="22"/></>,
  play: <polygon points="6 4 20 12 6 20 6 4"/>,
  square: <rect x="5" y="5" width="14" height="14" rx="2"/>,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>,
  radio: <><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48 0a6 6 0 0 1 0-8.49"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  shieldCheck: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></>,
  type: <><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></>,
  palette: <><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.4 0 2.5-1.1 2.5-2.5 0-.6-.2-1.2-.6-1.6-.4-.4-.6-1-.6-1.6 0-1.4 1.1-2.5 2.5-2.5H18c2.2 0 4-1.8 4-4 0-4.4-4.5-8-10-8z"/></>,
  layout: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  externalLink: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  moreH: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  panelLeft: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  alertTriangle: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.81 19.81 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.95 10.95 0 0 1 12 4c7 0 11 8 11 8a19.88 19.88 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  star: <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 9 12 2"/>,
  rotateCw: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  alignLeft: <><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></>,
  alignCenter: <><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></>,
  alignRight: <><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></>,
  rocket: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></>,
};
function Icon({ name, size = 18, stroke = 1.75, className = "", style }) {
  const path = ICON_PATHS[name];
  if (!path) return <span style={{display:"inline-block", width: size, height: size}} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round"
         className={"icon " + className} style={style} aria-hidden="true">
      {path}
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────
// Button
// ────────────────────────────────────────────────────────────────
function Button({ variant = "secondary", size = "md", children, loading, iconLeft, iconRight, onClick, type = "button", className = "", style, ...rest }) {
  return (
    <button type={type} onClick={onClick}
            className={`btn ${variant} ${size} ${className}`} style={style} {...rest}>
      {loading && <span className="btn-spinner" style={{width:14, height:14, border:"2px solid currentColor", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite"}}/>}
      {!loading && iconLeft && <Icon name={iconLeft} size={size === "sm" ? 14 : 16}/>}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16}/>}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// Badge
// ────────────────────────────────────────────────────────────────
function Badge({ variant = "neutral", children, dot = false }) {
  return (
    <span className={`badge ${variant}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────
// Switch
// ────────────────────────────────────────────────────────────────
function Switch({ value, onChange, ...rest }) {
  return (
    <button type="button" className="switch" data-on={value ? "1" : "0"}
            role="switch" aria-checked={!!value}
            onClick={() => onChange && onChange(!value)} {...rest}>
      <i />
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// Segmented
// ────────────────────────────────────────────────────────────────
function Segmented({ value, options, onChange }) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => {
        const v = typeof o === "object" ? o.value : o;
        const l = typeof o === "object" ? o.label : o;
        return (
          <button key={v} role="radio" type="button"
                  aria-pressed={v === value}
                  onClick={() => onChange(v)}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Code block (copyable)
// ────────────────────────────────────────────────────────────────
function CodeBlock({ value, onCopy }) {
  const [copied, setCopied] = React.useState(false);
  const handle = () => {
    try { navigator.clipboard?.writeText(value); } catch {}
    setCopied(true);
    onCopy && onCopy();
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="codeblock">
      <span className="code">{value}</span>
      <button className="copy" onClick={handle}>
        <Icon name={copied ? "check" : "copy"} size={12}/>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Card
// ────────────────────────────────────────────────────────────────
function Card({ children, elevated, className = "", style }) {
  return <div className={`card ${elevated ? "elevated" : ""} ${className}`} style={style}>{children}</div>;
}

// ────────────────────────────────────────────────────────────────
// LiveIndicator — pulsing dot + label + BCP-47 pill
// ────────────────────────────────────────────────────────────────
function LiveIndicator({ live = false, language = "es" }) {
  return (
    <div style={{display:"inline-flex", alignItems:"center", gap: 8}}>
      <Badge variant={live ? "live" : "neutral"} dot={live}>
        {live ? "LIVE" : "OFFLINE"}
      </Badge>
      <span className="badge neutral" style={{fontFamily:"var(--font-mono)", fontSize:11}}>
        {language}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Waveform — animated bars (mic monitor)
// ────────────────────────────────────────────────────────────────
function Waveform({ color }) {
  return (
    <span className="waveform" style={{ color: color || "var(--color-success)" }}>
      <i className="bar"/><i className="bar"/><i className="bar"/><i className="bar"/><i className="bar"/><i className="bar"/><i className="bar"/>
    </span>
  );
}

// ────────────────────────────────────────────────────────────────
// LatencyMeter — small bar graph showing recent 60s, with p50/p95
// ────────────────────────────────────────────────────────────────
function LatencyMeter({ speed = 1 }) {
  const N = 28;
  const [bars, setBars] = React.useState(() =>
    Array.from({ length: N }, () => 280 + Math.random() * 220)
  );
  React.useEffect(() => {
    if (speed === 0) return;
    let id;
    const tick = () => {
      setBars((prev) => {
        const next = prev.slice(1);
        next.push(220 + Math.random() * 360 + (Math.random() < 0.05 ? 200 : 0));
        return next;
      });
    };
    id = setInterval(tick, Math.max(140, 900 / Math.max(0.2, speed)));
    return () => clearInterval(id);
  }, [speed]);
  const sorted = [...bars].sort((a, b) => a - b);
  const p50 = Math.round(sorted[Math.floor(N * 0.5)] || 0);
  const p95 = Math.round(sorted[Math.floor(N * 0.95)] || 0);
  const max = 900;
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap: 10 }}>
      <div className="latency-bars" aria-label={`Latency p50 ${p50}ms`}>
        {bars.map((v, i) => {
          const h = Math.max(2, Math.min(22, (v / max) * 22));
          let color = "var(--color-success)";
          if (v > 600) color = "var(--color-warning)";
          if (v > 800) color = "var(--color-danger)";
          return <span key={i} className="lb" style={{ height: h, background: color }}/>;
        })}
      </div>
      <div style={{display:"inline-flex", flexDirection:"column", lineHeight: 1.15}}>
        <span className="text-xs text-tnum" style={{color:"var(--color-text)"}}>
          <strong style={{fontWeight: 600}}>{p50}</strong>
          <span className="text-faint"> p50</span>
        </span>
        <span className="text-xs text-tnum text-muted">
          {p95} <span className="text-faint">p95</span>
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Language picker — combobox-style. (Static demo; click toggles)
// ────────────────────────────────────────────────────────────────
const LANGS = [
  { code: "en-US", native: "English", english: "English" },
  { code: "es",    native: "Español", english: "Spanish" },
  { code: "ja",    native: "日本語", english: "Japanese" },
  { code: "ko",    native: "한국어", english: "Korean" },
  { code: "pt-BR", native: "Português (BR)", english: "Portuguese (Brazil)" },
  { code: "fr",    native: "Français", english: "French" },
  { code: "de",    native: "Deutsch", english: "German" },
  { code: "zh",    native: "中文", english: "Chinese" },
  { code: "id",    native: "Bahasa Indonesia", english: "Indonesian" },
  { code: "ar",    native: "العربية", english: "Arabic" },
];

function LanguagePicker({ value = "es", onChange, compact = false }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    const handler = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);
  const cur = LANGS.find(l => l.code === value) || LANGS[0];
  return (
    <div ref={rootRef} style={{ position:"relative", minWidth: compact ? 0 : 200 }}>
      <button type="button"
              className="btn secondary"
              style={{ width: compact ? "auto" : "100%", justifyContent:"space-between", height: 36 }}
              onClick={() => setOpen(o => !o)}>
        <span style={{display:"inline-flex", alignItems:"center", gap: 8}}>
          <span className="text-mono text-xs" style={{color:"var(--color-text-muted)"}}>{cur.code}</span>
          <span style={{fontWeight: 500}}>{cur.native}</span>
        </span>
        <Icon name="chevronDown" size={14}/>
      </button>
      {open && (
        <div className="menu" style={{ top: "calc(100% + 6px)", left: 0, right: 0, minWidth: 240, maxHeight: 320, overflow:"auto" }}>
          {LANGS.map(l => (
            <div key={l.code}
                 className="menu-item"
                 onClick={() => { onChange && onChange(l.code); setOpen(false); }}
                 style={{ height: 40, gap: 12 }}>
              <span className="text-mono text-xs" style={{color:"var(--color-text-muted)", width: 48}}>{l.code}</span>
              <div style={{display:"flex", flexDirection:"column", lineHeight: 1.2}}>
                <span style={{fontSize: 13, fontWeight: 500}}>{l.native}</span>
                <span className="text-xs text-faint">{l.english}</span>
              </div>
              {l.code === value && <Icon name="check" size={14} style={{marginLeft:"auto", color:"var(--color-accent)"}}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// KeyCard — provider icon + label + last4 + last-used + revoke
// ────────────────────────────────────────────────────────────────
function KeyCard({ provider, label, last4, lastUsed, status = "validated" }) {
  return (
    <Card>
      <div style={{ padding: 18, display:"flex", flexDirection:"column", gap: 14 }}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap: 12}}>
            <div style={{width:36, height:36, borderRadius:8, background:"var(--color-surface-elevated)", border:"1px solid var(--color-border)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-mono)", fontSize:13, fontWeight: 700, letterSpacing: "-0.02em"}}>
              {provider === "deepgram" ? "Δ" : provider === "deepl" ? "DL" : "?"}
            </div>
            <div>
              <div style={{fontSize: 14, fontWeight: 600}}>{label}</div>
              <div className="text-xs text-muted text-mono">•••• •••• •••• {last4}</div>
            </div>
          </div>
          {status === "validated" && <Badge variant="success" dot>Validated</Badge>}
          {status === "warning" && <Badge variant="warning" dot>Rate-limited</Badge>}
          {status === "invalid" && <Badge variant="danger" dot>Invalid</Badge>}
        </div>
        <div className="separator"/>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div className="text-xs text-muted">
            <Icon name="clock" size={12} style={{verticalAlign:-2, marginRight: 4}}/>
            Last used {lastUsed}
          </div>
          <div style={{display:"flex", gap: 6}}>
            <Button size="sm" variant="ghost" iconLeft="rotateCw">Rotate</Button>
            <Button size="sm" variant="ghost" iconLeft="trash">Revoke</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// SubtitlePreview — renders a caption with style applied
// ────────────────────────────────────────────────────────────────
function captionStyleToCss(s) {
  const padX = s.padX ?? 24;
  const padY = s.padY ?? 12;
  const bg = s.bgMode === "transparent" ? "transparent"
           : s.bgMode === "blur" ? "rgba(0,0,0,.35)"
           : (s.bg || "rgba(0,0,0,.65)");
  return {
    fontFamily: s.font || "Inter, sans-serif",
    fontWeight: s.weight ?? 700,
    fontSize: (s.size ?? 30) + "px",
    lineHeight: s.lineHeight ?? 1.2,
    letterSpacing: (s.letterSpacing ?? 0) + "em",
    color: s.color || "#ffffff",
    textAlign: s.align || "center",
    textTransform: s.case === "AA" ? "uppercase" : s.case === "aa" ? "lowercase" : "none",
    background: bg,
    padding: `${padY}px ${padX}px`,
    borderRadius: (s.radius ?? 8) + "px",
    WebkitTextStroke: s.strokeWidth ? `${s.strokeWidth}px ${s.strokeColor || "#000"}` : "0",
    textShadow: s.shadow ? `${s.shadowX || 0}px ${s.shadowY || 2}px ${s.shadowBlur || 4}px ${s.shadowColor || "rgba(0,0,0,.6)"}` : "none",
    backdropFilter: s.bgMode === "blur" ? `blur(${s.bgBlur ?? 12}px)` : "none",
    maxWidth: (s.maxWidth ?? 80) + "%",
    display: "inline-block",
  };
}

function SubtitlePreview({ style, text = "Welcome back to the stream." }) {
  return <span style={captionStyleToCss(style)}>{text}</span>;
}

// ────────────────────────────────────────────────────────────────
// OauthProviderButton
// ────────────────────────────────────────────────────────────────
function OauthProviderButton({ provider, children }) {
  const mark = provider === "twitch" ? "T" : provider === "google" ? "G" : "D";
  return (
    <button className="oauth-btn" data-provider={provider}>
      <span className="provider-mark">{mark}</span>
      <span className="label">{children}</span>
      <Icon name="arrowRight" size={16} style={{color:"var(--color-text-faint)"}}/>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// EmptyState
// ────────────────────────────────────────────────────────────────
function EmptyState({ illustration, title, body, cta }) {
  return (
    <div style={{ padding: 56, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
      {illustration}
      <h3 className="text-h3" style={{margin: "0 0 6px"}}>{title}</h3>
      <p className="text-muted" style={{margin: "0 0 18px", maxWidth: 360}}>{body}</p>
      {cta}
    </div>
  );
}

// SVG line-art illustrations — single-line, accent only
function EmptyIllu({ kind }) {
  const stroke = "var(--color-accent)";
  if (kind === "no-keys") return (
    <svg className="empty-illu" viewBox="0 0 140 100" fill="none" stroke={stroke} strokeWidth="1.5">
      <circle cx="45" cy="58" r="14"/>
      <path d="M59 58 L110 58"/>
      <path d="M95 58 L95 70 M105 58 L105 75"/>
      <circle cx="45" cy="58" r="4" fill={stroke}/>
      <path d="M20 30 L120 30" strokeDasharray="3 4" opacity="0.3"/>
    </svg>
  );
  if (kind === "no-profiles") return (
    <svg className="empty-illu" viewBox="0 0 140 100" fill="none" stroke={stroke} strokeWidth="1.5">
      <rect x="20" y="30" width="100" height="40" rx="4"/>
      <path d="M40 50 L100 50" strokeDasharray="2 3"/>
      <path d="M50 60 L90 60" strokeDasharray="2 3"/>
      <circle cx="115" cy="25" r="6" fill="var(--color-bg)"/>
      <path d="M112 25 L118 25 M115 22 L115 28"/>
    </svg>
  );
  if (kind === "no-tokens") return (
    <svg className="empty-illu" viewBox="0 0 140 100" fill="none" stroke={stroke} strokeWidth="1.5">
      <path d="M25 50 L115 50"/>
      <rect x="40" y="40" width="20" height="20" rx="2"/>
      <rect x="80" y="40" width="20" height="20" rx="2"/>
      <path d="M60 50 L80 50"/>
      <circle cx="50" cy="50" r="2" fill={stroke}/>
      <circle cx="90" cy="50" r="2" fill={stroke}/>
    </svg>
  );
  if (kind === "no-sessions") return (
    <svg className="empty-illu" viewBox="0 0 140 100" fill="none" stroke={stroke} strokeWidth="1.5">
      <path d="M20 70 L40 50 L55 60 L75 35 L95 50 L120 25"/>
      <circle cx="40" cy="50" r="2" fill={stroke}/>
      <circle cx="55" cy="60" r="2" fill={stroke}/>
      <circle cx="75" cy="35" r="2" fill={stroke}/>
      <circle cx="95" cy="50" r="2" fill={stroke}/>
      <path d="M15 85 L125 85" opacity="0.3"/>
    </svg>
  );
  return null;
}

// ────────────────────────────────────────────────────────────────
// Toast (sticky rate limit)
// ────────────────────────────────────────────────────────────────
function RateLimitToast({ retryIn = 14 }) {
  return (
    <div style={{
      position:"fixed", top: 80, right: 24, zIndex: 100,
      background:"var(--color-surface-elevated)", border:"1px solid var(--color-warning)",
      borderRadius:"var(--radius)", padding:"12px 14px",
      display:"flex", gap: 10, alignItems:"center",
      boxShadow:"var(--shadow-pop)", maxWidth: 320,
    }}>
      <Icon name="alertTriangle" size={18} style={{color:"var(--color-warning)"}}/>
      <div style={{flex: 1}}>
        <div style={{fontSize: 13, fontWeight: 600}}>Deepgram rate-limited</div>
        <div className="text-xs text-muted">Retrying in {retryIn}s. We're throttling automatically.</div>
      </div>
      <button className="btn ghost icon-only sm" aria-label="Dismiss"><Icon name="x" size={14}/></button>
    </div>
  );
}

Object.assign(window, {
  Icon, Button, Badge, Switch, Segmented, CodeBlock, Card,
  LiveIndicator, Waveform, LatencyMeter, LanguagePicker,
  KeyCard, SubtitlePreview, captionStyleToCss,
  OauthProviderButton, EmptyState, EmptyIllu, RateLimitToast,
  LANGS,
});

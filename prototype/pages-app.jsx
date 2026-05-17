// pages-app.jsx — Dashboard, Overlay Builder, Profiles, Keys, Tokens, Sessions, Settings

// Default style for builder + presets
const PRESETS = {
  broadcast: {
    name: "Broadcast",
    font: "Inter, sans-serif",
    weight: 700, size: 36, lineHeight: 1.2, letterSpacing: 0,
    color: "#FFFFFF", align: "center", case: "Aa",
    bgMode: "solid", bg: "rgba(0,0,0,0.65)", padX: 24, padY: 12, radius: 8,
    strokeWidth: 0, strokeColor: "#000000",
    shadow: true, shadowX: 0, shadowY: 2, shadowBlur: 6, shadowColor: "rgba(0,0,0,.6)",
    position: "bottom", maxWidth: 80, margin: 48,
    fadeMs: 150, holdMs: 1200, maxLines: 2,
  },
  minimal: {
    name: "Minimal",
    font: "Inter, sans-serif",
    weight: 600, size: 30, lineHeight: 1.25, letterSpacing: 0,
    color: "#FFFFFF", align: "center", case: "Aa",
    bgMode: "transparent", bg: "transparent", padX: 0, padY: 0, radius: 0,
    strokeWidth: 2, strokeColor: "rgba(0,0,0,.9)",
    shadow: true, shadowX: 0, shadowY: 1, shadowBlur: 4, shadowColor: "rgba(0,0,0,.55)",
    position: "bottom", maxWidth: 70, margin: 56,
    fadeMs: 100, holdMs: 800, maxLines: 2,
  },
  vtuber: {
    name: "VTuber",
    font: "Inter, sans-serif",
    weight: 700, size: 32, lineHeight: 1.2, letterSpacing: 0,
    color: "#FFFFFF", align: "center", case: "Aa",
    bgMode: "solid", bg: "rgba(155,133,255,0.85)", padX: 28, padY: 14, radius: 24,
    strokeWidth: 0, strokeColor: "#000000",
    shadow: true, shadowX: 0, shadowY: 4, shadowBlur: 12, shadowColor: "rgba(124,92,255,.4)",
    position: "bottom", maxWidth: 75, margin: 64,
    fadeMs: 220, holdMs: 1400, maxLines: 2,
  },
  esports: {
    name: "Esports",
    font: "JetBrains Mono, monospace",
    weight: 600, size: 26, lineHeight: 1.25, letterSpacing: 0.02,
    color: "#34D399", align: "left", case: "AA",
    bgMode: "solid", bg: "rgba(0,0,0,0.78)", padX: 18, padY: 10, radius: 4,
    strokeWidth: 0, strokeColor: "#000000",
    shadow: false,
    position: "bottom", maxWidth: 65, margin: 48,
    fadeMs: 80, holdMs: 1000, maxLines: 2,
  },
};

// ────────────────────────────────────────────────────────────────
// Sidebar
// ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "/dashboard", label: "Overview", icon: "layoutDashboard" },
  { id: "/dashboard/overlay-builder", label: "Overlay builder", icon: "sliders" },
  { id: "/dashboard/profiles", label: "Profiles", icon: "layers" },
  { id: "/dashboard/keys", label: "Keys", icon: "key" },
  { id: "/dashboard/tokens", label: "Tokens", icon: "link2" },
  { id: "/dashboard/sessions", label: "Sessions", icon: "history" },
  { id: "/dashboard/settings", label: "Settings", icon: "settings" },
];

function Sidebar({ route, onNav, collapsed, onToggleCollapsed }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="wordmark wordmark-text">Relay</span>
        <button className="btn ghost icon-only sm collapse-btn" onClick={onToggleCollapsed} aria-label="Collapse">
          <Icon name="panelLeft" size={14}/>
        </button>
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 2}}>
        {NAV.map(item => (
          <div key={item.id}
               className={`nav-item ${route === item.id ? "active" : ""}`}
               onClick={() => onNav(item.id)}>
            <Icon name={item.icon} size={18} className="icon"/>
            <span className="label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="sidebar-foot">
        <div className="nav-item" style={{height: 40}}>
          <div className="avatar" style={{width: 24, height: 24, fontSize: 11}}>K</div>
          <div className="label" style={{display:"flex", flexDirection:"column", lineHeight: 1.2}}>
            <span style={{fontSize: 13, color:"var(--color-text)", fontWeight: 500}}>kazue.tv</span>
            <span className="text-xs text-faint">Beta · Free</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, crumbs, right }) {
  return (
    <header className="topbar">
      {crumbs && (
        <div className="crumbs">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Icon name="chevronRight" size={12}/>}
              <span style={{color: i === crumbs.length - 1 ? "var(--color-text)" : undefined}}>{c}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      {title && !crumbs && <div className="title">{title}</div>}
      <div className="spacer"/>
      {right}
      <div className="avatar" data-tip="kazue.tv">K</div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────
// Dashboard overview
// ────────────────────────────────────────────────────────────────
function DashboardPage({ onNav, accent }) {
  const sessions = [
    { date: "16 May", duration: "1h 23m", lang: "es", chars: "12,408" },
    { date: "15 May", duration: "42m", lang: "ja", chars: "5,920" },
    { date: "14 May", duration: "2h 10m", lang: "pt-BR", chars: "19,711" },
    { date: "11 May", duration: "55m", lang: "es", chars: "7,310" },
  ];
  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Dashboard</h1>
          <p>Your stream booth, at a glance.</p>
        </div>
        <Button variant="primary" iconLeft="play" onClick={() => onNav("/dashboard/overlay-builder")}>Open builder</Button>
      </div>

      {/* Quick start */}
      <div className="card" style={{padding: 28, marginBottom: 24, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top: -40, right: -40, width: 240, height: 240, background:"radial-gradient(circle, var(--color-accent-soft) 0%, transparent 70%)", pointerEvents:"none"}}/>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16}}>
          <div style={{display:"flex", gap: 14, alignItems:"center"}}>
            <Badge variant="success" dot><strong style={{fontWeight: 600}}>LIVE READY</strong></Badge>
            <span className="text-sm text-muted">All keys validated · 2 profiles · 1 active token</span>
          </div>
          <Waveform/>
        </div>
        <div style={{display:"flex", gap: 24, alignItems:"flex-end", flexWrap:"wrap"}}>
          <div>
            <div className="text-xs text-muted" style={{marginBottom: 4}}>Source</div>
            <div style={{display:"flex", alignItems:"center", gap: 8}}>
              <span className="text-mono text-xs" style={{color:"var(--color-text-muted)"}}>en-US</span>
              <span style={{fontSize: 18, fontWeight: 500}}>English</span>
            </div>
          </div>
          <Icon name="arrowRight" size={20} style={{color:"var(--color-text-faint)", marginBottom: 6}}/>
          <div>
            <div className="text-xs text-muted" style={{marginBottom: 4}}>Target</div>
            <div style={{display:"flex", alignItems:"center", gap: 8}}>
              <span className="text-mono text-xs" style={{color:"var(--color-text-muted)"}}>es</span>
              <span style={{fontSize: 18, fontWeight: 500}}>Español</span>
            </div>
          </div>
          <div style={{width: 1, height: 32, background:"var(--color-border)", margin: "0 8px"}}/>
          <div>
            <div className="text-xs text-muted" style={{marginBottom: 4}}>Profile</div>
            <div style={{fontSize: 16, fontWeight: 500}}>Default · Broadcast</div>
          </div>
          <div style={{flex: 1}}/>
          <div style={{display:"flex", gap: 8}}>
            <Button variant="secondary" iconLeft="copy">Copy overlay URL</Button>
            <Button variant="primary" iconLeft="sliders" onClick={() => onNav("/dashboard/overlay-builder")}>Open builder</Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4" style={{marginBottom: 24}}>
        {[
          { label: "Streamed this month", value: "12h 41m", trend: "+3h vs last", color: "var(--color-text)" },
          { label: "Chars translated", value: "184,201", trend: "+22% vs last", color: "var(--color-text)" },
          { label: "p50 latency", value: "412 ms", trend: "−18 ms", color: "var(--color-success)" },
          { label: "Errors (7d)", value: "0", trend: "all good", color: "var(--color-success)" },
        ].map(s => (
          <div key={s.label} className="card card-body">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="text-tnum" style={{fontSize: 24, fontWeight: 600, margin: "6px 0 4px", color: s.color}}>{s.value}</div>
            <div className="text-xs text-faint">{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Recent sessions + keys */}
      <div className="grid gap-4" style={{gridTemplateColumns: "2fr 1fr"}}>
        <Card>
          <div style={{padding: "16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h3 className="text-h3" style={{margin: 0}}>Recent sessions</h3>
            <Button variant="link" size="sm" onClick={() => onNav("/dashboard/sessions")}>View all</Button>
          </div>
          <div className="separator"/>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Duration</th><th>Target</th><th style={{textAlign:"right"}}>Characters</th></tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td>{s.date}</td>
                  <td className="text-tnum">{s.duration}</td>
                  <td><span className="text-mono text-xs" style={{color:"var(--color-text-muted)"}}>{s.lang}</span></td>
                  <td className="text-tnum" style={{textAlign:"right"}}>{s.chars}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{display:"flex", flexDirection:"column", gap: 16}}>
          <Card>
            <div style={{padding: "16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <h3 className="text-h3" style={{margin: 0}}>Keys</h3>
              <Button variant="link" size="sm" onClick={() => onNav("/dashboard/keys")}>Manage</Button>
            </div>
            <div className="separator"/>
            <div style={{padding: "14px 20px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding: "8px 0"}}>
                <div>
                  <div style={{fontSize: 14, fontWeight: 500}}>Deepgram</div>
                  <div className="text-xs text-muted text-mono">•••• AB12</div>
                </div>
                <Badge variant="success" dot>OK</Badge>
              </div>
              <div className="separator"/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding: "8px 0"}}>
                <div>
                  <div style={{fontSize: 14, fontWeight: 500}}>DeepL</div>
                  <div className="text-xs text-muted text-mono">•••• XK90</div>
                </div>
                <Badge variant="success" dot>OK</Badge>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{padding: 18}}>
              <div className="text-xs text-muted" style={{marginBottom: 6}}>Active token</div>
              <CodeBlock value="https://relay.live/overlay/tk_8aF2··nQ7K"/>
              <div style={{display:"flex", gap: 6, marginTop: 10}}>
                <Button size="sm" variant="ghost" iconLeft="rotateCw">Rotate</Button>
                <Button size="sm" variant="ghost" onClick={() => onNav("/dashboard/tokens")}>All tokens</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Overlay Builder (the hero workspace)
// ────────────────────────────────────────────────────────────────
function OverlayBuilderPage({ onNav, presetKey, accent, latencySpeed }) {
  const [style, setStyle] = React.useState(() => ({ ...PRESETS[presetKey] || PRESETS.broadcast }));
  const [tab, setTab] = React.useState("typography");
  const [live, setLive] = React.useState(false);
  const [src, setSrc] = React.useState("en-US");
  const [tgt, setTgt] = React.useState("es");
  const [showSafeArea, setShowSafeArea] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState(null);
  const debTimer = React.useRef(null);

  // When preset tweak changes, swap in new style
  React.useEffect(() => {
    setStyle({ ...PRESETS[presetKey] });
  }, [presetKey]);

  const update = (patch) => {
    setStyle(prev => ({ ...prev, ...patch }));
    // simulate debounced save
    clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => setSavedAt(new Date()), 280);
  };

  // Cycling sample phrases for the live preview
  const samples = [
    { src: "Welcome back to the stream.", tgt: "Bienvenidos de nuevo al directo." },
    { src: "Let's see how this run goes.", tgt: "Veamos cómo va esta partida." },
    { src: "Thanks for the sub, much love.", tgt: "Gracias por la suscripción, mucho amor." },
  ];
  const [pi, setPi] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setPi(p => (p + 1) % samples.length), 3500);
    return () => clearInterval(id);
  }, []);

  // caption positioning
  const positionStyle = (() => {
    const margin = (style.margin ?? 48) + "px";
    if (style.position === "top") return { top: margin, left: 0, right: 0, justifyContent:"center", alignItems:"flex-start" };
    if (style.position === "center") return { top: 0, bottom: 0, left: 0, right: 0, alignItems:"center", justifyContent:"center" };
    return { bottom: margin, left: 0, right: 0, justifyContent:"center", alignItems:"flex-end" };
  })();

  return (
    <div className="page-shell wide fade-in" style={{display:"grid", gridTemplateColumns: "360px 1fr", height: "100%"}}>
      {/* LEFT: StyleEditor */}
      <div style={{borderRight: "1px solid var(--color-border)", display:"flex", flexDirection:"column", background: "var(--color-surface)"}}>
        <div style={{padding: "20px 20px 12px"}}>
          <div className="text-xs" style={{color:"var(--color-text-faint)", letterSpacing:"0.08em", textTransform:"uppercase"}}>Caption style</div>
          <h2 className="text-h3" style={{margin: "4px 0 0"}}>Default profile</h2>
        </div>
        <div className="tabs" style={{paddingLeft: 12, paddingRight: 12}}>
          {[
            { id: "typography", l: "Type", ic: "type" },
            { id: "background", l: "Background", ic: "palette" },
            { id: "layout", l: "Layout", ic: "layout" },
            { id: "behavior", l: "Behavior", ic: "clock" },
          ].map(t => (
            <button key={t.id} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              <Icon name={t.ic} size={14}/> {t.l}
            </button>
          ))}
        </div>
        <div style={{padding: 20, overflow:"auto", flex: 1, display:"flex", flexDirection:"column", gap: 16}}>
          {tab === "typography" && (
            <>
              <div>
                <label className="label">Font</label>
                <select className="select" value={style.font} onChange={e => update({font: e.target.value})}>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                  <option value="'Atkinson Hyperlegible', sans-serif">Atkinson Hyperlegible</option>
                  <option value="'IBM Plex Sans', sans-serif">IBM Plex Sans</option>
                  <option value="'Manrope', sans-serif">Manrope</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>
              <div>
                <label className="label">Weight</label>
                <Segmented value={style.weight} options={[
                  {value: 400, label: "400"}, {value: 500, label: "500"}, {value: 600, label: "600"}, {value: 700, label: "700"}, {value: 800, label: "800"},
                ]} onChange={v => update({weight: v})}/>
              </div>
              <SliderRow label="Size" value={style.size} min={16} max={96} unit="px" onChange={v => update({size: v})}/>
              <SliderRow label="Line height" value={style.lineHeight} min={0.8} max={2.0} step={0.05} onChange={v => update({lineHeight: v})}/>
              <SliderRow label="Letter spacing" value={style.letterSpacing} min={-0.05} max={0.2} step={0.005} unit="em" onChange={v => update({letterSpacing: v})}/>
              <ColorRow label="Text color" value={style.color} onChange={v => update({color: v})}/>
              <div>
                <label className="label">Alignment</label>
                <Segmented value={style.align} options={[
                  {value: "left", label: <Icon name="alignLeft" size={14}/>},
                  {value: "center", label: <Icon name="alignCenter" size={14}/>},
                  {value: "right", label: <Icon name="alignRight" size={14}/>},
                ]} onChange={v => update({align: v})}/>
              </div>
              <div>
                <label className="label">Case</label>
                <Segmented value={style.case} options={["Aa", "AA", "aa"]} onChange={v => update({case: v})}/>
              </div>
              <SliderRow label="Stroke width" value={style.strokeWidth ?? 0} min={0} max={12} onChange={v => update({strokeWidth: v})}/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <label className="label" style={{margin: 0}}>Drop shadow</label>
                <Switch value={!!style.shadow} onChange={v => update({shadow: v})}/>
              </div>
            </>
          )}
          {tab === "background" && (
            <>
              <div>
                <label className="label">Mode</label>
                <Segmented value={style.bgMode} options={[
                  {value:"transparent", label:"None"},
                  {value:"solid", label:"Solid"},
                  {value:"blur", label:"Blur"},
                ]} onChange={v => update({bgMode: v})}/>
              </div>
              {style.bgMode === "solid" && <ColorRow label="Background" value={style.bg} onChange={v => update({bg: v})}/>}
              {style.bgMode === "blur" && (
                <>
                  <SliderRow label="Blur amount" value={style.bgBlur ?? 12} min={0} max={24} unit="px" onChange={v => update({bgBlur: v})}/>
                  <div style={{padding: 12, background:"var(--color-warning-soft)", borderRadius: 8, fontSize: 12, color:"var(--color-warning)", display:"flex", gap: 8}}>
                    <Icon name="alertTriangle" size={14} style={{flexShrink: 0, marginTop: 2}}/>
                    OBS 30.0+ required for blur backgrounds.
                  </div>
                </>
              )}
              <SliderRow label="Padding X" value={style.padX} min={0} max={80} unit="px" onChange={v => update({padX: v})}/>
              <SliderRow label="Padding Y" value={style.padY} min={0} max={80} unit="px" onChange={v => update({padY: v})}/>
              <SliderRow label="Corner radius" value={style.radius} min={0} max={32} unit="px" onChange={v => update({radius: v})}/>
            </>
          )}
          {tab === "layout" && (
            <>
              <div>
                <label className="label">Position</label>
                <Segmented value={style.position} options={["top", "center", "bottom"]} onChange={v => update({position: v})}/>
              </div>
              <SliderRow label="Max width" value={style.maxWidth} min={30} max={100} unit="%" onChange={v => update({maxWidth: v})}/>
              <SliderRow label="Margin" value={style.margin} min={0} max={200} unit="px" onChange={v => update({margin: v})}/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <label className="label" style={{margin: 0}}>Safe-area guides</label>
                <Switch value={showSafeArea} onChange={setShowSafeArea}/>
              </div>
            </>
          )}
          {tab === "behavior" && (
            <>
              <SliderRow label="Fade in/out" value={style.fadeMs} min={0} max={500} step={10} unit="ms" onChange={v => update({fadeMs: v})}/>
              <SliderRow label="Hold" value={style.holdMs} min={0} max={4000} step={50} unit="ms" onChange={v => update({holdMs: v})}/>
              <div>
                <label className="label">Max lines</label>
                <Segmented value={style.maxLines} options={[{value:1, label:"1"}, {value:2, label:"2"}, {value:3, label:"3"}]} onChange={v => update({maxLines: v})}/>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: preview */}
      <div style={{display:"flex", flexDirection:"column", overflow:"auto"}}>
        <div style={{padding: 24, display:"flex", alignItems:"center", gap: 16, borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)"}}>
          <LanguagePicker value={src} onChange={setSrc} compact/>
          <Icon name="arrowRight" size={16} style={{color:"var(--color-text-faint)"}}/>
          <LanguagePicker value={tgt} onChange={setTgt} compact/>
          <div style={{width: 1, height: 24, background:"var(--color-border)"}}/>
          <LiveIndicator live={live} language={tgt}/>
          <div style={{width: 1, height: 24, background:"var(--color-border)"}}/>
          <LatencyMeter speed={latencySpeed}/>
          <div style={{flex: 1}}/>
          {savedAt && <span className="saved-pill"><span className="dot"/>Saved · just now</span>}
          <Button variant={live ? "destructive" : "primary"} iconLeft={live ? "square" : "mic"} onClick={() => setLive(!live)}>
            {live ? "Stop session" : "Start session"}
          </Button>
        </div>

        <div style={{flex: 1, padding: 24, display:"flex", flexDirection:"column", gap: 16, background: "var(--color-bg)"}}>
          <div className="caption-stage-mock with-scene" style={{position:"relative"}}>
            <span className="scene-label">/// preview · 1920×1080</span>
            <div className="scene-badges">
              {live && <Badge variant="live" dot>REC</Badge>}
              <span className="badge neutral" style={{background:"rgba(255,255,255,.06)", borderColor:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.7)", fontFamily:"var(--font-mono)", fontSize: 10}}>SCENE: GAMEPLAY</span>
            </div>
            {showSafeArea && (
              <>
                <div className="safe-area"/>
                <div className="safe-area" style={{inset: "10%"}}/>
              </>
            )}
            <div className="caption-render" style={positionStyle}>
              <span key={pi} className="fade-in" style={captionStyleToCss(style)}>
                {samples[pi].tgt}
              </span>
            </div>
            {/* Mini source preview overlay */}
            <div style={{position:"absolute", bottom: 12, left: 12, padding: "6px 10px", background:"rgba(0,0,0,.4)", borderRadius: 6, color:"rgba(255,255,255,.5)", fontSize: 11, fontFamily: "var(--font-mono)", maxWidth: "40%"}}>
              ← {samples[pi].src}
            </div>
          </div>

          {/* Browser source URL */}
          <div className="card card-body" style={{display:"flex", alignItems:"center", gap: 12}}>
            <div style={{flex: 1, minWidth: 0}}>
              <div className="text-xs text-muted" style={{marginBottom: 6}}>Browser source URL</div>
              <CodeBlock value="https://relay.live/overlay/tk_8aF2bX9LMnQ7KdR3Vw1Z·default·en→es"/>
            </div>
            <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap: 4}}>
              <Button size="sm" variant="ghost" iconLeft="rotateCw" onClick={() => onNav("/dashboard/tokens")}>Rotate token</Button>
              <Button size="sm" variant="ghost" iconLeft="externalLink" onClick={() => onNav("/overlay/demo")}>Open standalone</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SliderRow helper
function SliderRow({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom: 6}}>
        <label className="label" style={{margin: 0}}>{label}</label>
        <span className="text-xs text-tnum text-muted">{typeof value === "number" ? (Math.round(value * 1000) / 1000) : value}{unit}</span>
      </div>
      <input type="range" className="slider accent" min={min} max={max} step={step} value={value}
             onChange={e => onChange(Number(e.target.value))}/>
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div style={{display:"flex", gap: 8, alignItems:"center"}}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: value,
          border: "1px solid var(--color-border-strong)",
          backgroundImage: "linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.08) 75%), linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.08) 75%)",
          backgroundSize: "8px 8px",
          backgroundPosition: "0 0, 4px 4px",
        }}>
          <div style={{width:"100%", height:"100%", background: value, borderRadius: 5}}/>
        </div>
        <input className="input mono" style={{flex: 1, fontSize: 12, height: 32}} value={value} onChange={e => onChange(e.target.value)}/>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Profiles list
// ────────────────────────────────────────────────────────────────
function ProfilesPage({ onNav }) {
  const profiles = [
    { name: "Default — Broadcast", style: PRESETS.broadcast, isDefault: true, lastUsed: "Now" },
    { name: "Minimal Subs", style: PRESETS.minimal, lastUsed: "Yesterday" },
    { name: "VTuber Pink", style: PRESETS.vtuber, lastUsed: "11 May" },
    { name: "Esports Comms", style: PRESETS.esports, lastUsed: "8 May" },
  ];
  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Profiles</h1>
          <p>Save your caption style. Reuse it across tokens.</p>
        </div>
        <Button variant="primary" iconLeft="plus">New profile</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {profiles.map(p => (
          <Card key={p.name}>
            <div style={{padding: 16}}>
              <div className="profile-card-stage">
                <div style={{position:"absolute", bottom: 14, left: "50%", transform: "translateX(-50%)"}}>
                  <span style={{
                    ...captionStyleToCss({ ...p.style, size: 14, padX: 12, padY: 6 }),
                    fontSize: 14,
                  }}>
                    Hola, equipo.
                  </span>
                </div>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 12}}>
                <div>
                  <div style={{fontSize: 14, fontWeight: 600, display:"flex", alignItems:"center", gap: 8}}>
                    {p.name}
                    {p.isDefault && <Badge variant="accent">Default</Badge>}
                  </div>
                  <div className="text-xs text-muted">Last used {p.lastUsed}</div>
                </div>
                <Button size="sm" variant="ghost" iconLeft="edit"/>
              </div>
            </div>
          </Card>
        ))}
        {/* Add card */}
        <div className="card" style={{padding: 16, display:"flex", alignItems:"center", justifyContent:"center", minHeight: 196, border: "1px dashed var(--color-border-strong)", cursor:"pointer", background: "transparent"}}>
          <div style={{textAlign:"center"}}>
            <Icon name="plus" size={24} style={{color: "var(--color-text-muted)", marginBottom: 6}}/>
            <div className="text-sm text-muted">Create new profile</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Keys
// ────────────────────────────────────────────────────────────────
function KeysPage() {
  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Keys</h1>
          <p>Your Deepgram and DeepL credentials. Encrypted at rest, decrypted only for live sessions.</p>
        </div>
        <Button variant="primary" iconLeft="plus" iconRight="chevronDown">Add key</Button>
      </div>

      {/* Step-up auth banner */}
      <div className="card" style={{padding: 14, marginBottom: 20, display:"flex", alignItems:"center", gap: 12, borderColor: "var(--color-accent)", background: "var(--color-accent-soft)"}}>
        <Icon name="shieldCheck" size={18} style={{color:"var(--color-accent)"}}/>
        <div className="flex-1">
          <div style={{fontSize: 13, fontWeight: 600}}>You're verified for the next 4m 32s</div>
          <div className="text-xs text-muted">Adding, rotating, or revoking keys is allowed.</div>
        </div>
        <Button size="sm" variant="ghost">Extend</Button>
      </div>

      <div style={{marginBottom: 12, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform:"uppercase", color: "var(--color-text-faint)"}}>Transcription</div>
      <div style={{marginBottom: 16}}>
        <KeyCard provider="deepgram" label="Deepgram production" last4="AB12" lastUsed="2 minutes ago" status="validated"/>
      </div>

      <div style={{marginBottom: 12, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform:"uppercase", color: "var(--color-text-faint)"}}>Translation</div>
      <div style={{display:"flex", flexDirection:"column", gap: 12}}>
        <KeyCard provider="deepl" label="DeepL Pro" last4="XK90" lastUsed="2 minutes ago" status="validated"/>
        <KeyCard provider="deepl" label="DeepL Free (backup)" last4="JJ41" lastUsed="6 days ago" status="warning"/>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Tokens
// ────────────────────────────────────────────────────────────────
function TokensPage() {
  const rows = [
    { label: "Main stream · ES", pair: "en-US → es", profile: "Default — Broadcast", created: "10 May", lastUsed: "Just now" },
    { label: "JP fans", pair: "en-US → ja", profile: "Minimal Subs", created: "08 May", lastUsed: "12 May" },
    { label: "Esports comms", pair: "en-US → pt-BR", profile: "Esports Comms", created: "01 May", lastUsed: "—" },
  ];
  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Overlay tokens</h1>
          <p>Each token is a unique browser-source URL bound to a profile and a language pair.</p>
        </div>
        <Button variant="primary" iconLeft="plus">New token</Button>
      </div>

      <Card>
        <table className="table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Pair</th>
              <th>Profile</th>
              <th>Created</th>
              <th>Last used</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td><div style={{fontWeight: 500}}>{r.label}</div></td>
                <td><span className="text-mono text-xs">{r.pair}</span></td>
                <td className="text-muted">{r.profile}</td>
                <td className="text-muted">{r.created}</td>
                <td className="text-muted">{r.lastUsed}</td>
                <td className="actions">
                  <Button size="sm" variant="ghost" iconLeft="copy" data-tip="Copy URL"/>
                  <Button size="sm" variant="ghost" iconLeft="rotateCw" data-tip="Rotate"/>
                  <Button size="sm" variant="ghost" iconLeft="trash" data-tip="Revoke"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="card card-body" style={{marginTop: 16, display:"flex", gap: 12, alignItems:"flex-start"}}>
        <Icon name="info" size={18} style={{color: "var(--color-text-faint)", marginTop: 2}}/>
        <div className="text-sm text-muted">
          The plaintext token is only visible immediately after creation. Lose it, and you'll need to rotate. Rotation invalidates the old URL — update OBS afterwards.
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Sessions
// ────────────────────────────────────────────────────────────────
function SessionsPage() {
  const rows = [
    { date: "16 May · 21:04", dur: "1h 23m", tgt: "es", chars: "12,408", p50: 412, p95: 740, errs: 0 },
    { date: "15 May · 20:51", dur: "42m",   tgt: "ja", chars: "5,920",  p50: 488, p95: 820, errs: 1 },
    { date: "14 May · 19:12", dur: "2h 10m", tgt: "pt-BR", chars: "19,711", p50: 401, p95: 690, errs: 0 },
    { date: "11 May · 22:30", dur: "55m",   tgt: "es", chars: "7,310",  p50: 433, p95: 750, errs: 0 },
    { date: "10 May · 18:48", dur: "1h 04m", tgt: "es", chars: "8,924",  p50: 460, p95: 800, errs: 2 },
    { date: "08 May · 21:14", dur: "31m",   tgt: "ja", chars: "3,481",  p50: 510, p95: 880, errs: 0 },
  ];
  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Sessions</h1>
          <p>Every stream you've translated, with the receipts.</p>
        </div>
        <div style={{display:"flex", gap: 8}}>
          <Segmented value="7d" options={["24h", "7d", "30d", "All"]} onChange={() => {}}/>
          <Button variant="secondary" iconLeft="download">Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{marginBottom: 24}}>
        {[
          {label: "Sessions", value: "37"},
          {label: "Hours streamed", value: "48h 11m"},
          {label: "Chars translated", value: "847,930"},
          {label: "Avg p50 latency", value: "434 ms", c: "var(--color-success)"},
        ].map(s => (
          <div key={s.label} className="card card-body">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="text-tnum" style={{fontSize: 26, fontWeight: 600, marginTop: 4, color: s.c || "var(--color-text)"}}>{s.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Target</th>
              <th style={{textAlign:"right"}}>Characters</th>
              <th style={{textAlign:"right"}}>p50</th>
              <th style={{textAlign:"right"}}>p95</th>
              <th style={{textAlign:"right"}}>Errors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td className="text-tnum">{r.dur}</td>
                <td><span className="text-mono text-xs">{r.tgt}</span></td>
                <td className="text-tnum" style={{textAlign:"right"}}>{r.chars}</td>
                <td className="text-tnum" style={{textAlign:"right", color: r.p50 > 500 ? "var(--color-warning)" : "var(--color-success)"}}>{r.p50} ms</td>
                <td className="text-tnum" style={{textAlign:"right"}}>{r.p95} ms</td>
                <td className="text-tnum" style={{textAlign:"right", color: r.errs > 0 ? "var(--color-warning)" : "var(--color-text-muted)"}}>{r.errs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Settings
// ────────────────────────────────────────────────────────────────
function SettingsPage({ themeMode, setThemeMode }) {
  const [name, setName] = React.useState("Kazue Yamada");
  const [locale, setLocale] = React.useState("en-US");
  return (
    <div className="page-shell fade-in" style={{maxWidth: 760}}>
      <div className="page-head">
        <div>
          <h1 className="text-h1">Settings</h1>
          <p>You, your appearance, your data.</p>
        </div>
      </div>

      {/* Profile */}
      <Card style={{marginBottom: 16}}>
        <div style={{padding: 24}}>
          <div className="text-h3" style={{marginBottom: 4}}>Profile</div>
          <div className="text-sm text-muted" style={{marginBottom: 20}}>Visible only to you.</div>
          <div style={{display: "flex", gap: 16, alignItems:"center", marginBottom: 16}}>
            <div className="avatar" style={{width: 56, height: 56, fontSize: 20}}>K</div>
            <Button variant="secondary" iconLeft="upload">Change avatar</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Display name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)}/>
            </div>
            <div>
              <label className="label">Locale</label>
              <LanguagePicker value={locale} onChange={setLocale}/>
            </div>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card style={{marginBottom: 16}}>
        <div style={{padding: 24}}>
          <div className="text-h3" style={{marginBottom: 4}}>Appearance</div>
          <div className="text-sm text-muted" style={{marginBottom: 20}}>Theme also drives the dashboard, not your overlay output.</div>
          <Segmented value={themeMode} options={[
            {value:"light", label: <><Icon name="sun" size={14}/> Light</>},
            {value:"dark",  label: <><Icon name="moon" size={14}/> Dark</>},
            {value:"system",label: <><Icon name="monitor" size={14}/> System</>},
          ]} onChange={setThemeMode}/>
        </div>
      </Card>

      {/* Data / Danger */}
      <Card style={{marginBottom: 16, borderColor: "var(--color-border)"}}>
        <div style={{padding: 24}}>
          <div className="text-h3" style={{marginBottom: 4}}>Data</div>
          <div className="text-sm text-muted" style={{marginBottom: 20}}>Take it with you, or take it down.</div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding: "12px 0"}}>
            <div>
              <div style={{fontSize: 14, fontWeight: 500}}>Export account data</div>
              <div className="text-xs text-muted">JSON: profiles, tokens, session metrics. No content.</div>
            </div>
            <Button variant="secondary" iconLeft="download">Export</Button>
          </div>
          <div className="separator"/>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding: "12px 0"}}>
            <div>
              <div style={{fontSize: 14, fontWeight: 500, color: "var(--color-danger)"}}>Delete account</div>
              <div className="text-xs text-muted">7-day grace period. Everything goes after that.</div>
            </div>
            <Button variant="destructive" iconLeft="trash">Delete account</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, {
  Sidebar, TopBar,
  DashboardPage, OverlayBuilderPage,
  ProfilesPage, KeysPage, TokensPage, SessionsPage, SettingsPage,
  PRESETS,
});

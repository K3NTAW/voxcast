// app.jsx — Root shell, routing, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "sidebarCollapsed": false,
  "accent": "violet",
  "preset": "broadcast",
  "latencySpeed": 1
}/*EDITMODE-END*/;

// Accent palettes — token swaps for --color-accent + supporting tokens
const ACCENTS = {
  violet: { dark: "#9B85FF", strong: "#7C5CFF", soft: "rgba(155,133,255,0.12)",
            light: "#7C5CFF", strongLight: "#6747FF", softLight: "rgba(124,92,255,0.10)" },
  cyan:   { dark: "#22D3EE", strong: "#06B6D4", soft: "rgba(34,211,238,0.14)",
            light: "#0891B2", strongLight: "#0E7490", softLight: "rgba(8,145,178,0.12)" },
  lime:   { dark: "#A3E635", strong: "#84CC16", soft: "rgba(163,230,53,0.14)",
            light: "#65A30D", strongLight: "#4D7C0F", softLight: "rgba(101,163,13,0.12)" },
  orange: { dark: "#FF8A4C", strong: "#FF6A3D", soft: "rgba(255,138,76,0.14)",
            light: "#EA580C", strongLight: "#C2410C", softLight: "rgba(234,88,12,0.12)" },
};

function applyAccent(name, themeMode) {
  const a = ACCENTS[name] || ACCENTS.violet;
  const root = document.documentElement;
  const isLight = themeMode === "light";
  root.style.setProperty("--color-accent", isLight ? a.light : a.dark);
  root.style.setProperty("--color-accent-strong", isLight ? a.strongLight : a.strong);
  root.style.setProperty("--color-accent-soft", isLight ? a.softLight : a.soft);
}

function parseRoute(hash) {
  const h = (hash || "").replace(/^#/, "") || "/";
  return h;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(() => parseRoute(window.location.hash));

  // Apply theme to documentElement
  React.useEffect(() => {
    const isLight = t.theme === "light";
    document.documentElement.classList.toggle("light", isLight);
    applyAccent(t.accent, t.theme);
  }, [t.theme, t.accent]);

  // Hash routing
  React.useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = React.useCallback((to) => {
    window.location.hash = to;
    // Scroll content to top of overflow container
    requestAnimationFrame(() => {
      document.querySelectorAll(".app-content, .mkt-shell").forEach(el => el.scrollTo({top: 0}));
    });
  }, []);

  // Determine shell type
  const isMarketing = route === "/" || route.startsWith("/docs") || route === "/privacy" || route === "/terms" || route === "/security";
  const isAuth      = route === "/login" || route === "/onboarding";
  const isOverlay   = route.startsWith("/overlay");
  const isApp       = route.startsWith("/dashboard");

  return (
    <>
      {isMarketing && (
        <MarketingShell onNav={navigate}>
          {route === "/" && <LandingPage onNav={navigate}/>}
          {route === "/docs/obs" && <DocsObsPage onNav={navigate}/>}
          {route === "/docs/meld" && <DocsObsPage onNav={navigate}/>}
          {route === "/privacy" && <PrivacyPage/>}
          {route === "/terms" && <TermsPage/>}
          {route === "/security" && <SecurityPage/>}
        </MarketingShell>
      )}

      {isAuth && (
        <>
          {route === "/login" && <LoginPage onNav={navigate}/>}
          {route === "/onboarding" && <OnboardingPage onNav={navigate}/>}
        </>
      )}

      {isApp && (
        <div className={`app-shell ${t.sidebarCollapsed ? "collapsed" : ""}`}>
          <Sidebar route={route} onNav={navigate}
                   collapsed={t.sidebarCollapsed}
                   onToggleCollapsed={() => setTweak("sidebarCollapsed", !t.sidebarCollapsed)}/>
          {route === "/dashboard" && (
            <>
              <TopBar crumbs={["Dashboard"]} />
              <div className="app-content"><DashboardPage onNav={navigate} accent={t.accent}/></div>
            </>
          )}
          {route === "/dashboard/overlay-builder" && (
            <>
              <TopBar crumbs={["Dashboard", "Overlay builder"]} right={<Button size="sm" variant="ghost" iconLeft="rocket" onClick={() => navigate("/overlay/demo")}>View overlay</Button>}/>
              <div className="app-content" style={{overflow:"hidden"}}>
                <OverlayBuilderPage onNav={navigate} presetKey={t.preset} accent={t.accent} latencySpeed={t.latencySpeed}/>
              </div>
            </>
          )}
          {route === "/dashboard/profiles" && (
            <>
              <TopBar crumbs={["Dashboard", "Profiles"]}/>
              <div className="app-content"><ProfilesPage onNav={navigate}/></div>
            </>
          )}
          {route === "/dashboard/keys" && (
            <>
              <TopBar crumbs={["Dashboard", "Keys"]}/>
              <div className="app-content"><KeysPage/></div>
            </>
          )}
          {route === "/dashboard/tokens" && (
            <>
              <TopBar crumbs={["Dashboard", "Tokens"]}/>
              <div className="app-content"><TokensPage/></div>
            </>
          )}
          {route === "/dashboard/sessions" && (
            <>
              <TopBar crumbs={["Dashboard", "Sessions"]}/>
              <div className="app-content"><SessionsPage/></div>
            </>
          )}
          {route === "/dashboard/settings" && (
            <>
              <TopBar crumbs={["Dashboard", "Settings"]}/>
              <div className="app-content"><SettingsPage themeMode={t.theme} setThemeMode={(v) => setTweak("theme", v === "system" ? "dark" : v)}/></div>
            </>
          )}
        </div>
      )}

      {isOverlay && <OverlayPage onNav={navigate} presetKey={t.preset}/>}

      {/* Demo nav helper bar for marketing & auth (small floating menu so user can jump around) */}
      <DemoNav route={route} onNav={navigate}/>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio label="Mode" value={t.theme} options={["light", "dark"]} onChange={(v) => setTweak("theme", v)}/>
          <TweakSelect label="Accent" value={t.accent} options={[
            {value:"violet", label:"Electric violet"},
            {value:"cyan",   label:"Cyan"},
            {value:"lime",   label:"Lime"},
            {value:"orange", label:"Orange"},
          ]} onChange={(v) => setTweak("accent", v)}/>
        </TweakSection>
        <TweakSection label="Layout">
          <TweakToggle label="Sidebar collapsed" value={t.sidebarCollapsed} onChange={(v) => setTweak("sidebarCollapsed", v)}/>
        </TweakSection>
        <TweakSection label="Caption preset">
          <TweakSelect label="Preset" value={t.preset} options={[
            {value:"broadcast", label:"Broadcast"},
            {value:"minimal",   label:"Minimal"},
            {value:"vtuber",    label:"VTuber"},
            {value:"esports",   label:"Esports"},
          ]} onChange={(v) => setTweak("preset", v)}/>
        </TweakSection>
        <TweakSection label="Simulation">
          <TweakSlider label="Latency tick speed" value={t.latencySpeed} min={0.2} max={3} step={0.1} unit="×"
                       onChange={(v) => setTweak("latencySpeed", v)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// Small floating jump menu so the prototype is navigable without the sidebar
function DemoNav({ route, onNav }) {
  const [open, setOpen] = React.useState(false);
  const groups = [
    { l: "Marketing", routes: [
      {r:"/", n:"Landing"},
      {r:"/docs/obs", n:"Docs · OBS"},
      {r:"/security", n:"Security"},
      {r:"/privacy", n:"Privacy"},
      {r:"/terms", n:"Terms"},
    ]},
    { l: "Auth", routes: [
      {r:"/login", n:"Login"},
      {r:"/onboarding", n:"Onboarding"},
    ]},
    { l: "App", routes: [
      {r:"/dashboard", n:"Overview"},
      {r:"/dashboard/overlay-builder", n:"Overlay builder"},
      {r:"/dashboard/profiles", n:"Profiles"},
      {r:"/dashboard/keys", n:"Keys"},
      {r:"/dashboard/tokens", n:"Tokens"},
      {r:"/dashboard/sessions", n:"Sessions"},
      {r:"/dashboard/settings", n:"Settings"},
    ]},
    { l: "Public", routes: [
      {r:"/overlay/demo", n:"Overlay (transparent)"},
    ]},
  ];

  return (
    <div style={{position:"fixed", left: 16, bottom: 16, zIndex: 200}}>
      {open && (
        <div style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 8,
          width: 260,
          marginBottom: 8,
          boxShadow: "var(--shadow-pop)",
          maxHeight: 460,
          overflow: "auto",
        }}>
          <div style={{padding: "6px 8px", fontSize: 11, color: "var(--color-text-faint)", letterSpacing: "0.08em", textTransform:"uppercase"}}>Jump to</div>
          {groups.map(g => (
            <div key={g.l} style={{marginBottom: 6}}>
              <div style={{padding: "4px 8px", fontSize: 10, color: "var(--color-text-faint)", letterSpacing: "0.08em", textTransform:"uppercase"}}>{g.l}</div>
              {g.routes.map(r => (
                <div key={r.r}
                     onClick={() => { onNav(r.r); setOpen(false); }}
                     style={{
                       padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                       fontSize: 13, color: route === r.r ? "var(--color-accent)" : "var(--color-text)",
                       background: route === r.r ? "var(--color-accent-soft)" : "transparent",
                       display: "flex", justifyContent: "space-between", alignItems:"center",
                     }}
                     onMouseEnter={(e) => { if (route !== r.r) e.currentTarget.style.background = "var(--color-surface-hover)"; }}
                     onMouseLeave={(e) => { if (route !== r.r) e.currentTarget.style.background = "transparent"; }}>
                  {r.n}
                  {route === r.r && <Icon name="check" size={12}/>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{
        height: 36, padding: "0 12px",
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        color: "var(--color-text)",
        display: "inline-flex", alignItems: "center", gap: 8,
        cursor: "pointer",
        fontFamily: "inherit", fontSize: 13, fontWeight: 500,
        boxShadow: "var(--shadow-card)",
      }}>
        <Icon name="menu" size={14}/>
        <span style={{fontFamily:"var(--font-mono)", fontSize: 11, color:"var(--color-text-muted)"}}>{route}</span>
        <Icon name={open ? "chevronDown" : "chevronRight"} size={12} style={{color:"var(--color-text-muted)"}}/>
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);

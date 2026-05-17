// pages-overlay.jsx — the public /overlay/[token] page (transparent OBS source)

function OverlayPage({ onNav, presetKey }) {
  const style = PRESETS[presetKey] || PRESETS.broadcast;
  const phrases = [
    "Bienvenidos de nuevo al directo.",
    "Veamos cómo va esta partida.",
    "Gracias por la suscripción.",
    "Vamos a la revancha, GG.",
  ];
  const [pi, setPi] = React.useState(0);
  const [shown, setShown] = React.useState(true);
  React.useEffect(() => {
    let mounted = true;
    const tick = async () => {
      while (mounted) {
        await new Promise(r => setTimeout(r, style.holdMs ?? 1500));
        setShown(false);
        await new Promise(r => setTimeout(r, style.fadeMs ?? 150));
        setPi(p => (p + 1) % phrases.length);
        setShown(true);
        await new Promise(r => setTimeout(r, 2200));
      }
    };
    tick();
    return () => { mounted = false; };
  }, [style.holdMs, style.fadeMs, presetKey]);

  const margin = (style.margin ?? 48) + "px";
  const align = style.position === "top" ? "flex-start"
              : style.position === "center" ? "center" : "flex-end";

  return (
    <div className="overlay-page">
      {/* Faux OBS chrome — only here on the demo URL, NOT in actual output */}
      <div style={{position: "absolute", top: 0, left: 0, right: 0, padding: "12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", color:"rgba(255,255,255,.5)", fontSize: 11, fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase"}}>
        <div style={{display:"flex", gap: 12, alignItems:"center"}}>
          <span>OBS Browser Source · 1920×1080</span>
          <span style={{color:"rgba(255,255,255,.3)"}}>·</span>
          <span style={{color:"rgba(255,255,255,.4)"}}>?debug=1</span>
        </div>
        <div style={{display:"flex", gap: 12, alignItems:"center"}}>
          <span style={{display:"inline-flex", alignItems:"center", gap: 6}}>
            <span style={{width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399"}}/>
            connected
          </span>
          <span>p50 412ms</span>
          <button onClick={() => onNav("/dashboard")} style={{background:"transparent", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.7)", borderRadius:6, padding:"4px 10px", fontFamily:"inherit", fontSize: 11, cursor:"pointer"}}>← Back to dashboard</button>
        </div>
      </div>

      {/* Background fake stream — only because it's a preview. Production overlay is fully transparent. */}
      <div style={{position:"absolute", inset: 0, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <div style={{fontFamily:"var(--font-mono)", fontSize: 10, color:"rgba(255,255,255,.25)", textTransform:"uppercase", letterSpacing:"0.12em"}}>
          this background is for preview only — real overlay is transparent
        </div>
      </div>

      {/* The caption */}
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", justifyContent: "center", alignItems: align,
        padding: margin,
        pointerEvents: "none",
      }}>
        <span style={{
          ...captionStyleToCss(style),
          opacity: shown ? 1 : 0,
          transition: `opacity ${style.fadeMs ?? 150}ms cubic-bezier(.2,.8,.2,1)`,
        }}>
          {phrases[pi]}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { OverlayPage });

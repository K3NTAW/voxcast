// pages-marketing.jsx — Landing, Docs, Privacy, Terms, Security

function MarketingShell({ children, onNav }) {
  return (
    <div className="mkt-shell">
      <nav className="mkt-nav">
        <a onClick={() => onNav("/")} style={{cursor:"pointer"}}><span className="wordmark">Relay</span></a>
        <div className="spacer"/>
        <a onClick={() => onNav("/docs/obs")} style={{cursor:"pointer"}}>Docs</a>
        <a onClick={() => onNav("/security")} style={{cursor:"pointer"}}>Security</a>
        <a onClick={() => onNav("/login")} style={{cursor:"pointer"}}>Sign in</a>
        <Button variant="primary" onClick={() => onNav("/login")}>Get started</Button>
      </nav>
      {children}
      <footer style={{borderTop: "1px solid var(--color-border)", padding: "32px 0", marginTop: 80}}>
        <div className="mkt-container" style={{display: "flex", justifyContent:"space-between", alignItems:"center"}}>
          <span className="wordmark" style={{fontSize: 13}}>Relay</span>
          <div style={{display:"flex", gap: 20}} className="text-sm text-muted">
            <a onClick={() => onNav("/privacy")} style={{cursor:"pointer"}}>Privacy</a>
            <a onClick={() => onNav("/terms")} style={{cursor:"pointer"}}>Terms</a>
            <a onClick={() => onNav("/security")} style={{cursor:"pointer"}}>Security</a>
            <a style={{cursor:"pointer"}}>Status <span className="badge success" style={{padding:"0 6px", marginLeft: 4, verticalAlign: 1}} ><span className="dot"/>operational</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Landing
// ────────────────────────────────────────────────────────────────
function LandingPage({ onNav }) {
  // animated caption cycling in hero mock
  const phrases = [
    { src: "Welcome back to the stream.", tgt: "Bienvenidos de nuevo al directo.", lang: "es" },
    { src: "We just hit a new sub goal!",  tgt: "¡Acabamos de alcanzar una nueva meta!", lang: "es" },
    { src: "Let's run it back, GG.",       tgt: "Vamos a la revancha, GG.", lang: "es" },
  ];
  const [pi, setPi] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setPi(p => (p + 1) % phrases.length), 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <section style={{padding: "80px 0 40px", position:"relative", overflow:"hidden"}}>
        <div className="hero-bg"/>
        <div className="mkt-container" style={{position:"relative"}}>
          <Badge variant="accent" dot>
            <span style={{fontWeight: 500}}>Now in public beta</span>
          </Badge>
          <h1 className="text-display" style={{margin: "20px 0 18px", maxWidth: 880, textWrap:"balance"}}>
            Real-time translation<br/>for live streams.
          </h1>
          <p className="text-body text-muted" style={{maxWidth: 580, fontSize: 18, lineHeight: "26px", margin: "0 0 28px"}}>
            Bring your own Deepgram and DeepL keys. Drop the browser source into OBS. Done. Sub-second captions in your viewers' language, with the type, color, and motion you choose.
          </p>
          <div style={{display:"flex", gap: 10}}>
            <Button variant="primary" size="lg" onClick={() => onNav("/login")}>Start free</Button>
            <Button variant="secondary" size="lg" iconRight="arrowRight" onClick={() => onNav("/dashboard/overlay-builder")}>See it in OBS</Button>
          </div>
          <div className="text-xs text-faint" style={{marginTop: 14, display:"flex", gap: 16, alignItems:"center"}}>
            <span><Icon name="check" size={12} style={{verticalAlign: -2, marginRight: 4, color: "var(--color-success)"}}/>No credit card</span>
            <span><Icon name="check" size={12} style={{verticalAlign: -2, marginRight: 4, color: "var(--color-success)"}}/>OAuth-only</span>
            <span><Icon name="check" size={12} style={{verticalAlign: -2, marginRight: 4, color: "var(--color-success)"}}/>You own the bill</span>
          </div>
        </div>
      </section>

      {/* Hero mock — animated OBS preview */}
      <section style={{padding: "20px 0 80px"}}>
        <div className="mkt-container">
          <div className="hero-mock">
            <div style={{position:"absolute", inset: 12, display:"flex", flexDirection:"column"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div style={{display:"flex", gap: 8}}>
                  <Badge variant="live" dot>LIVE</Badge>
                  <span className="badge neutral" style={{background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.85)", borderColor:"transparent", fontFamily:"var(--font-mono)"}}>en-US → {phrases[pi].lang}</span>
                </div>
                <div style={{display:"flex", gap: 8, alignItems:"center", color:"rgba(255,255,255,.7)"}}>
                  <Waveform color="rgba(255,255,255,.8)"/>
                  <span className="text-mono text-xs">42 ms</span>
                </div>
              </div>
              <div style={{flex: 1}}/>
              <div style={{textAlign:"center", paddingBottom: 24}}>
                <div key={pi} className="fade-in" style={{
                  display:"inline-block",
                  padding: "14px 28px",
                  background: "rgba(0,0,0,.55)",
                  backdropFilter:"blur(8px)",
                  borderRadius: 12,
                  color:"white", fontSize: 28, fontWeight: 700,
                  textShadow:"0 2px 8px rgba(0,0,0,.5)",
                  border:"1px solid rgba(255,255,255,.06)",
                  maxWidth: "80%",
                  lineHeight: 1.2,
                }}>
                  {phrases[pi].tgt}
                </div>
                <div className="text-xs text-mono" style={{color:"rgba(255,255,255,.45)", marginTop: 10}}>
                  ← {phrases[pi].src}
                </div>
              </div>
            </div>
            <span style={{position:"absolute", top: 12, right: 12, fontFamily:"var(--font-mono)", fontSize: 10, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:"0.1em"}}>OBS Scene Preview</span>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section style={{padding: "40px 0"}}>
        <div className="mkt-container">
          <div className="grid grid-cols-3 gap-4">
            <div className="feature-card">
              <span className="ic"><Icon name="zap" size={18}/></span>
              <h3 className="text-h3">Sub-second latency</h3>
              <p>Deepgram streaming ASR into DeepL, into your overlay. The whole pipeline runs hot.</p>
            </div>
            <div className="feature-card">
              <span className="ic"><Icon name="key" size={18}/></span>
              <h3 className="text-h3">Your keys, your bill</h3>
              <p>BYOK for Deepgram and DeepL. We never sit between you and your providers. No per-minute markup.</p>
            </div>
            <div className="feature-card">
              <span className="ic"><Icon name="shieldCheck" size={18}/></span>
              <h3 className="text-h3">OWASP-hardened</h3>
              <p>Step-up auth for key changes, scoped overlay tokens, audit trail. Built to the OWASP ASVS bar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{padding: "60px 0"}}>
        <div className="mkt-container">
          <div className="section-eyebrow">How it works</div>
          <h2 className="text-h2" style={{margin: "0 0 32px"}}>Four steps. No video to watch.</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { n: "01", t: "Sign in", d: "OAuth with Twitch, Google, or Discord. No passwords stored." },
              { n: "02", t: "Add keys", d: "Paste your Deepgram and DeepL keys. We validate and encrypt." },
              { n: "03", t: "Pick languages", d: "Source language (your mic) and target language for viewers." },
              { n: "04", t: "Drop in OBS", d: "Copy the overlay URL. Add as a Browser source. Hit Start Streaming." },
            ].map(s => (
              <div key={s.n} style={{padding: 20, border: "1px solid var(--color-border)", borderRadius: 14, background: "var(--color-surface)"}}>
                <div className="text-mono text-xs" style={{color:"var(--color-accent)", marginBottom: 8}}>{s.n}</div>
                <div style={{fontSize: 16, fontWeight: 600, marginBottom: 6}}>{s.t}</div>
                <div className="text-sm text-muted">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works with */}
      <section style={{padding: "60px 0"}}>
        <div className="mkt-container">
          <div className="text-xs" style={{textAlign:"center", color:"var(--color-text-faint)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom: 18}}>Works with</div>
          <div style={{display:"flex", justifyContent:"center", alignItems:"center", gap: 60, opacity: 0.8, flexWrap:"wrap"}}>
            {["OBS Studio", "Meld Studio", "Streamlabs", "Twitch Studio", "vMix"].map(n => (
              <span key={n} style={{fontSize: 18, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "-0.01em"}}>{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{padding: "60px 0"}}>
        <div className="mkt-container">
          <div style={{
            border: "1px solid var(--color-border)", borderRadius: 14,
            padding: 56, textAlign: "center", position: "relative", overflow:"hidden",
            background: "linear-gradient(160deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
          }}>
            <div className="hero-bg"/>
            <div style={{position:"relative"}}>
              <h2 className="text-h1" style={{margin: "0 0 12px"}}>Bring your stream to everyone.</h2>
              <p className="text-muted" style={{margin: "0 0 24px", maxWidth: 480, marginInline:"auto"}}>
                Free during beta. Bring your own keys. Cancel anytime by deleting your account.
              </p>
              <Button variant="primary" size="lg" onClick={() => onNav("/login")}>Get started</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// Docs — OBS setup
// ────────────────────────────────────────────────────────────────
function DocsObsPage({ onNav }) {
  return (
    <section style={{padding: "60px 0"}}>
      <div className="mkt-container" style={{maxWidth: 720}}>
        <div className="text-sm text-muted" style={{marginBottom: 8, display:"flex", alignItems:"center", gap: 6}}>
          <a onClick={() => onNav("/")} style={{cursor:"pointer"}}>Home</a>
          <Icon name="chevronRight" size={12}/>
          <span>Docs</span>
          <Icon name="chevronRight" size={12}/>
          <span style={{color:"var(--color-text)"}}>OBS setup</span>
        </div>
        <h1 className="text-h1" style={{margin: "0 0 12px"}}>Set up Relay in OBS Studio</h1>
        <p className="text-muted" style={{margin: "0 0 32px", fontSize: 16}}>Five minutes. You'll need your overlay URL from the dashboard.</p>

        {[
          { n: "1", t: "Copy your overlay URL", d: "In the dashboard, open Overlay builder. Click 'Copy overlay URL' under the preview canvas." },
          { n: "2", t: "Add a Browser source", d: "In OBS, click the + under Sources. Choose Browser. Name it 'Relay captions'." },
          { n: "3", t: "Paste the URL", d: "URL field gets your overlay URL. Set width 1920, height 1080. Check 'Shutdown source when not visible' to save CPU." },
          { n: "4", t: "Position the overlay", d: "Drag the captions where you want them. The transparent background means they sit on top of your game capture." },
          { n: "5", t: "Start streaming", d: "Open your Relay dashboard, hit Start session. Captions begin flowing the moment you speak." },
        ].map(s => (
          <div key={s.n} style={{display:"flex", gap: 16, padding: "20px 0", borderBottom: "1px solid var(--color-border)"}}>
            <div style={{width: 32, height: 32, borderRadius: 16, background: "var(--color-accent-soft)", color: "var(--color-accent)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight: 600, flexShrink: 0}}>
              {s.n}
            </div>
            <div>
              <div style={{fontSize: 16, fontWeight: 600, marginBottom: 4}}>{s.t}</div>
              <div className="text-muted">{s.d}</div>
            </div>
          </div>
        ))}

        <div style={{marginTop: 32, padding: 18, border: "1px solid var(--color-warning)", borderRadius: 10, background: "var(--color-warning-soft)"}}>
          <div style={{display:"flex", gap: 10}}>
            <Icon name="info" size={18} style={{color:"var(--color-warning)", flexShrink: 0, marginTop: 2}}/>
            <div>
              <div style={{fontSize: 14, fontWeight: 600, marginBottom: 4}}>OBS 30.0 or newer recommended</div>
              <div className="text-sm text-muted">Older versions ship a CEF that doesn't support <span className="text-mono">backdrop-filter</span>, so blur backgrounds won't render. Other modes (solid, transparent) work everywhere.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Generic policy page (privacy/terms/security)
// ────────────────────────────────────────────────────────────────
function PolicyPage({ title, lead, sections }) {
  return (
    <section style={{padding: "60px 0"}}>
      <div className="mkt-container" style={{maxWidth: 720}}>
        <h1 className="text-h1" style={{margin: "0 0 12px"}}>{title}</h1>
        <p className="text-muted" style={{margin: "0 0 32px", fontSize: 16}}>{lead}</p>
        {sections.map((s, i) => (
          <div key={i} style={{marginBottom: 28}}>
            <h2 className="text-h3" style={{margin: "0 0 8px"}}>{s.t}</h2>
            <p className="text-muted" style={{margin: 0}}>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrivacyPage() {
  return <PolicyPage
    title="Privacy"
    lead="What we collect, what we don't, and how we treat your keys."
    sections={[
      { t: "Your audio never touches our servers", d: "Your microphone stream goes directly from your browser to Deepgram, using your key. We see translation requests by way of routing only — we don't store transcripts." },
      { t: "Your provider keys are encrypted at rest", d: "Keys are sealed with envelope encryption (AWS KMS), and only decrypted in memory when a session opens. We show you the last four characters and that's it." },
      { t: "Account data", d: "We store your OAuth identity (Twitch/Google/Discord user id + email), your subtitle profiles, your overlay tokens, and per-session metrics (duration, character counts, error counts). No content." },
      { t: "Deletion", d: "Delete your account from Settings → Data. We hold the data for 7 days in case you change your mind, then it's gone for good." },
    ]}
  />;
}

function TermsPage() {
  return <PolicyPage
    title="Terms"
    lead="The short version: be cool, don't break things, you own what you say."
    sections={[
      { t: "Use", d: "You may use Relay for any lawful purpose. We don't moderate your speech — that's between you and your platform." },
      { t: "Your accounts with providers", d: "Relay routes traffic to Deepgram and DeepL on your behalf. Their terms apply to that traffic. We don't accept liability for their decisions." },
      { t: "Service availability", d: "Relay is offered as-is during beta. We aim for 99.9% uptime but make no SLA. Status page at status.relay.live." },
      { t: "Termination", d: "Either side may terminate at any time. We'll delete your data on the schedule described in Privacy." },
    ]}
  />;
}

function SecurityPage() {
  return (
    <section style={{padding: "60px 0"}}>
      <div className="mkt-container" style={{maxWidth: 760}}>
        <h1 className="text-h1" style={{margin: "0 0 12px"}}>Security</h1>
        <p className="text-muted" style={{margin: "0 0 32px", fontSize: 16}}>We treat your provider keys and your overlay tokens like the credentials they are.</p>

        <div className="grid grid-cols-2 gap-4" style={{marginBottom: 32}}>
          {[
            { ic: "shieldCheck", t: "OWASP ASVS Level 2", d: "Authentication, session management, and access control built to ASVS L2. Third-party assessment in Q3." },
            { ic: "key", t: "Envelope encryption", d: "Provider keys sealed with AWS KMS, decrypted in-memory only for active sessions." },
            { ic: "user", t: "Step-up auth", d: "Adding, rotating, or revoking a key forces a fresh OAuth re-auth if your session is older than 5 minutes." },
            { ic: "link2", t: "Scoped overlay tokens", d: "Each token is bound to a single profile, language pair, and account. Rotate or revoke any time without breaking your scene." },
          ].map(s => (
            <div key={s.t} className="card card-body">
              <Icon name={s.ic} size={20} style={{color: "var(--color-accent)", marginBottom: 8}}/>
              <div style={{fontSize: 15, fontWeight: 600, marginBottom: 4}}>{s.t}</div>
              <div className="text-sm text-muted">{s.d}</div>
            </div>
          ))}
        </div>

        <h2 className="text-h3" style={{margin: "0 0 8px"}}>Report a vulnerability</h2>
        <p className="text-muted" style={{margin: 0}}>Mail security@relay.live with details. We acknowledge within 24 hours and patch critical issues within 7 days.</p>
      </div>
    </section>
  );
}

Object.assign(window, { MarketingShell, LandingPage, DocsObsPage, PrivacyPage, TermsPage, SecurityPage });

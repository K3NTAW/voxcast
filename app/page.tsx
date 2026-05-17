import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import { Icon } from "@/components/icon";

export default function LandingPage() {
  return (
    <div className="mkt-shell">
      <nav className="mkt-nav">
        <Link href="/" className="wordmark">
          Voxcast
        </Link>
        <div className="spacer" />
        <Link href="/docs/obs">Docs</Link>
        <Link href="/security">Security</Link>
        <Link href="/login">Sign in</Link>
        <Link href="/login" className="btn primary">
          Get started
        </Link>
      </nav>

      <section style={{ padding: "80px 0 40px", position: "relative", overflow: "hidden" }}>
        <div className="hero-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div className="mkt-container" style={{ position: "relative" }}>
          <Badge variant="accent" dot>
            <span style={{ fontWeight: 500 }}>Now in public beta</span>
          </Badge>
          <h1 className="text-display" style={{ margin: "20px 0 18px", maxWidth: 880 }}>
            Real-time translation
            <br />
            for live streams.
          </h1>
          <p
            className="text-body text-muted"
            style={{ maxWidth: 580, fontSize: 18, lineHeight: "26px", margin: "0 0 28px" }}
          >
            Bring your own Deepgram and DeepL keys. Drop the browser source into OBS. Done. Sub-second captions in your
            viewers' language, with the type, color, and motion you choose.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/login" className="btn primary lg">
              Start free
            </Link>
            <Link href="/docs/obs" className="btn secondary lg">
              See it in OBS
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          <div className="text-xs text-faint" style={{ marginTop: 14, display: "flex", gap: 16 }}>
            <span>
              <Icon name="check" size={12} className="inline-block" /> No credit card
            </span>
            <span>
              <Icon name="check" size={12} className="inline-block" /> OAuth-only
            </span>
            <span>
              <Icon name="check" size={12} className="inline-block" /> You own the bill
            </span>
          </div>
        </div>
      </section>

      <section style={{ padding: "20px 0 80px" }}>
        <div className="mkt-container">
          <div className="hero-mock">
            <div style={{ position: "absolute", inset: 12, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Badge variant="live" dot>
                    LIVE
                  </Badge>
                  <span
                    className="badge neutral"
                    style={{
                      background: "rgba(255,255,255,.08)",
                      color: "rgba(255,255,255,.85)",
                      borderColor: "transparent",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    en-US → es
                  </span>
                </div>
                <span className="text-xs text-mono" style={{ color: "rgba(255,255,255,.4)" }}>
                  p50 412ms
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", justifyContent: "center", padding: "0 0 28px" }}>
                <span
                  style={{
                    background: "rgba(0,0,0,.65)",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: 12,
                    fontSize: 32,
                    fontWeight: 700,
                  }}
                >
                  Bienvenidos de nuevo al directo.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 80px" }}>
        <div className="mkt-container">
          <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              {
                ic: "zap",
                t: "Sub-second latency",
                p: "Deepgram nova-2 streaming STT and DeepL translation, pipelined for the lowest path-length to your viewer.",
              },
              {
                ic: "key",
                t: "Your keys, your bills",
                p: "Bring your own Deepgram and DeepL API keys. We never charge per minute and never store plaintext keys.",
              },
              {
                ic: "shieldCheck",
                t: "OWASP-hardened",
                p: "ASVS L2 controls. CSP, HSTS, AES-256-GCM at rest, audit logging, rate-limited everything.",
              },
            ].map((c) => (
              <div key={c.t} className="feature-card">
                <div className="ic">
                  <Icon name={c.ic as any} size={18} />
                </div>
                <h3 className="text-h3">{c.t}</h3>
                <p>{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 80px", textAlign: "center" }}>
        <div className="mkt-container">
          <h2 className="text-h2" style={{ margin: "0 0 12px" }}>
            Drop it into OBS in 30 seconds.
          </h2>
          <p className="text-muted" style={{ margin: "0 0 24px" }}>
            Sign in. Paste a Deepgram key. Paste a DeepL key. Copy the browser source URL.
          </p>
          <Link href="/login" className="btn primary lg">
            Start free
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--color-border)", padding: "32px 0" }}>
        <div
          className="mkt-container"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span className="wordmark" style={{ fontSize: 13 }}>
            Voxcast
          </span>
          <div style={{ display: "flex", gap: 20 }} className="text-sm text-muted">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/security">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

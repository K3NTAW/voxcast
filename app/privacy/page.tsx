import Link from "next/link";

export default function Privacy() {
  return (
    <div className="mkt-shell">
      <nav className="mkt-nav">
        <Link href="/" className="wordmark">
          Voxcast
        </Link>
        <div className="spacer" />
        <Link href="/login">Sign in</Link>
      </nav>
      <div className="mkt-container" style={{ padding: "60px 0 80px", maxWidth: 720 }}>
        <h1 className="text-h1">Privacy</h1>
        <p className="text-muted">
          We store the minimum: your account profile, encrypted API keys (AES-256-GCM), subtitle profiles, overlay
          tokens (hashed), and per-session aggregate metrics. We do NOT store the audio you send through Voxcast, and we
          do NOT store the transcripts or translations — they flow through the worker and are dropped after broadcast.
          You can export everything via Settings → Data, and delete your account anytime.
        </p>
      </div>
    </div>
  );
}

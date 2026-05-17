import Link from "next/link";

export default function Terms() {
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
        <h1 className="text-h1">Terms</h1>
        <p className="text-muted">
          You bring your own Deepgram and DeepL keys. You're responsible for usage on those accounts. Voxcast provides
          the pipeline and UI; we don't act as a reseller. Use at your own risk during the public beta.
        </p>
      </div>
    </div>
  );
}

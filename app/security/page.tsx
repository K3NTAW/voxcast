import Link from "next/link";

export default function Security() {
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
        <h1 className="text-h1">Security</h1>
        <p className="text-muted">
          Voxcast targets OWASP ASVS L2. API keys are AES-256-GCM at rest with KMS-wrapped envelope keys. OAuth-only
          sign-in (Twitch, Google, Discord). CSP, HSTS, CORP/COEP, audit logging, and rate limits on every mutation
          endpoint. Find the full posture in our PLANNING.md, §8.
        </p>
      </div>
    </div>
  );
}

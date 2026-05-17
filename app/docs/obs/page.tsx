import Link from "next/link";
import { Card } from "@/components/ui";

export default function DocsObsPage() {
  return (
    <div className="mkt-shell">
      <nav className="mkt-nav">
        <Link href="/" className="wordmark">
          Voxcast
        </Link>
        <div className="spacer" />
        <Link href="/login">Sign in</Link>
      </nav>
      <div className="mkt-container" style={{ padding: "60px 0 80px" }}>
        <h1 className="text-h1" style={{ margin: "0 0 8px" }}>
          OBS Studio setup
        </h1>
        <p className="text-muted" style={{ margin: "0 0 32px" }}>
          Drop the Voxcast overlay into your scene as a Browser Source. 30 seconds, no plugins.
        </p>
        <Card>
          <ol style={{ padding: 28, paddingLeft: 60, lineHeight: 1.7 }}>
            <li>
              In <strong>Tokens</strong>, mint an overlay token. Copy the URL — it's only shown once.
            </li>
            <li>
              In OBS, add a <strong>Browser Source</strong> to your scene. Paste the URL.
            </li>
            <li>
              Set <strong>Width 1920</strong>, <strong>Height 1080</strong> (or your stream resolution).
            </li>
            <li>
              <strong>Uncheck</strong> "Shutdown source when not visible".
            </li>
            <li>
              <strong>Uncheck</strong> "Refresh browser when scene becomes active".
            </li>
            <li>
              In <strong>Overlay builder</strong>, click <strong>Start session</strong>. OBS now shows live captions.
            </li>
          </ol>
        </Card>
        <p className="text-muted text-sm" style={{ marginTop: 16 }}>
          Meld Studio: same Browser Source mechanism. The URL works as-is.
        </p>
      </div>
    </div>
  );
}

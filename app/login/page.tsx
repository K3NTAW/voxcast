import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn, availableProviders } from "@/lib/auth";
import { Card } from "@/components/ui";
import { Icon } from "@/components/icon";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth().catch(() => null);
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/dashboard";
  const providers = availableProviders();
  const labels: Record<string, string> = {
    twitch: "Continue with Twitch",
    google: "Continue with Google",
    discord: "Continue with Discord",
    dev: "Continue as Dev User",
  };

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <div style={{ padding: 32 }}>
          <Link href="/" className="wordmark" style={{ marginBottom: 24 }}>
            Voxcast
          </Link>
          <h1 className="text-h2" style={{ margin: "24px 0 8px" }}>
            Sign in to your stream booth
          </h1>
          <p className="text-muted text-sm" style={{ margin: "0 0 24px" }}>
            We use OAuth — we never see your provider password.
          </p>

          {params.error && (
            <div
              className="badge danger"
              style={{ marginBottom: 16, padding: "8px 12px", width: "100%", justifyContent: "flex-start" }}
            >
              <Icon name="alertTriangle" size={14} /> {decodeURIComponent(params.error)}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {providers.length === 0 && (
              <p className="text-muted text-sm" style={{ background: "var(--color-surface-elevated)", padding: 16, borderRadius: 8 }}>
                No auth providers configured. Set <code>DEV_AUTH_ENABLED=true</code> for a dev login, or set OAuth
                env vars (see <code>.env.example</code>).
              </p>
            )}
            {providers.map((p) => (
              <form
                key={p.id}
                action={async () => {
                  "use server";
                  if (p.id === "dev") {
                    await signIn("dev", { redirectTo: callbackUrl, email: "dev@voxcast.local", name: "Dev User" });
                  } else {
                    await signIn(p.id, { redirectTo: callbackUrl });
                  }
                }}
              >
                <button type="submit" className="oauth-btn" data-provider={p.id}>
                  <span className="provider-mark">
                    {p.id === "twitch" ? "T" : p.id === "google" ? "G" : p.id === "discord" ? "D" : "✓"}
                  </span>
                  <span className="label">{labels[p.id] ?? `Continue with ${p.name}`}</span>
                  <Icon name="arrowRight" size={16} />
                </button>
              </form>
            ))}
          </div>

          <div className="text-xs text-faint" style={{ marginTop: 20 }}>
            <Link href="/privacy">Privacy</Link>
            {" · "}
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

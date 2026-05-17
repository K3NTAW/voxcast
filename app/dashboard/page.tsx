import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, Badge, Waveform } from "@/components/ui";
import { Icon } from "@/components/icon";
import { formatDuration, formatRelative } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [keys, profiles, tokens, recent] = await Promise.all([
    prisma.apiKey.findMany({
      where: { userId, revokedAt: null },
      select: { id: true, provider: true, last4: true, lastUsedAt: true },
    }),
    prisma.subtitleProfile.findMany({ where: { userId }, select: { id: true, name: true, isDefault: true } }),
    prisma.overlayToken.findMany({
      where: { userId, revokedAt: null },
      select: { id: true, label: true, sourceLanguage: true, targetLanguage: true, lastUsedAt: true },
    }),
    prisma.streamSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: {
        id: true,
        startedAt: true,
        durationSec: true,
        sourceLanguage: true,
        targetLanguage: true,
        charsTranslated: true,
      },
    }),
  ]);

  const hasDeepgram = keys.some((k) => k.provider === "DEEPGRAM");
  const hasDeepL = keys.some((k) => k.provider === "DEEPL");
  const liveReady = hasDeepgram && hasDeepL && tokens.length > 0;
  const primary = tokens[0];

  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Dashboard</h1>
          <p>Your stream booth, at a glance.</p>
        </div>
        <Link href="/dashboard/overlay-builder" className="btn primary">
          <Icon name="play" size={16} /> Open builder
        </Link>
      </div>

      <Card className="card" style={{ padding: 28, marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 240,
            height: 240,
            background: "radial-gradient(circle, var(--color-accent-soft) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {liveReady ? (
              <Badge variant="success" dot>
                <strong style={{ fontWeight: 600 }}>LIVE READY</strong>
              </Badge>
            ) : (
              <Badge variant="warning" dot>
                <strong style={{ fontWeight: 600 }}>SETUP REQUIRED</strong>
              </Badge>
            )}
            <span className="text-sm text-muted">
              {hasDeepgram ? "Deepgram ✓" : "Deepgram missing"} ·{" "}
              {hasDeepL ? "DeepL ✓" : "DeepL missing"} · {profiles.length} profile{profiles.length === 1 ? "" : "s"} ·{" "}
              {tokens.length} token{tokens.length === 1 ? "" : "s"}
            </span>
          </div>
          {liveReady && <Waveform />}
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: 4 }}>
              Source
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="text-mono text-xs text-muted">{primary?.sourceLanguage ?? "—"}</span>
              <span style={{ fontSize: 18, fontWeight: 500 }}>
                {primary?.sourceLanguage === "en-US" ? "English" : primary?.sourceLanguage ?? "—"}
              </span>
            </div>
          </div>
          <Icon name="arrowRight" size={20} className="text-faint" />
          <div>
            <div className="text-xs text-muted" style={{ marginBottom: 4 }}>
              Target
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="text-mono text-xs text-muted">{primary?.targetLanguage ?? "—"}</span>
              <span style={{ fontSize: 18, fontWeight: 500 }}>{primary?.targetLanguage ?? "—"}</span>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {!hasDeepgram && (
              <Link href="/dashboard/keys" className="btn secondary">
                <Icon name="key" size={16} /> Add Deepgram
              </Link>
            )}
            {!hasDeepL && (
              <Link href="/dashboard/keys" className="btn secondary">
                <Icon name="key" size={16} /> Add DeepL
              </Link>
            )}
            <Link href="/dashboard/overlay-builder" className="btn primary">
              <Icon name="sliders" size={16} /> Open builder
            </Link>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ padding: 20 }}>
            <h3 className="text-h3" style={{ marginTop: 0 }}>
              Recent sessions
            </h3>
            {recent.length === 0 ? (
              <p className="text-muted text-sm">No sessions yet. Start one from the overlay builder.</p>
            ) : (
              <table className="table" style={{ width: "100%", marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Pair</th>
                    <th>Chars</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => (
                    <tr key={s.id}>
                      <td>{s.startedAt.toISOString().slice(0, 10)}</td>
                      <td>{formatDuration(s.durationSec)}</td>
                      <td className="text-mono text-sm">
                        {s.sourceLanguage} → {s.targetLanguage}
                      </td>
                      <td className="text-tnum">{s.charsTranslated?.toLocaleString() ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        <Card>
          <div style={{ padding: 20 }}>
            <h3 className="text-h3" style={{ marginTop: 0 }}>
              Your keys
            </h3>
            {keys.length === 0 && <p className="text-muted text-sm">No keys yet.</p>}
            {keys.map((k) => (
              <div
                key={k.id}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{k.provider === "DEEPGRAM" ? "Deepgram" : "DeepL"}</div>
                  <div className="text-xs text-muted text-mono">•••• {k.last4}</div>
                </div>
                <span className="text-xs text-faint">{k.lastUsedAt ? formatRelative(k.lastUsedAt) : "unused"}</span>
              </div>
            ))}
            <Link href="/dashboard/keys" className="btn ghost sm" style={{ marginTop: 8 }}>
              Manage keys
              <Icon name="arrowRight" size={12} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

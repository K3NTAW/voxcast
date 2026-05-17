import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui";
import { Icon } from "@/components/icon";
import { formatRelative } from "@/lib/utils";
import { AddKeyDialog } from "./_components/add-key";
import { RevokeKeyButton } from "./_components/revoke-key";

export default async function KeysPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Keys</h1>
          <p>BYOK — keys are encrypted at rest with AES-256-GCM. We never log plaintext.</p>
        </div>
        <AddKeyDialog />
      </div>

      {keys.length === 0 ? (
        <Card>
          <div style={{ padding: 56, textAlign: "center" }}>
            <Icon name="key" size={36} className="text-faint" />
            <h3 className="text-h3" style={{ margin: "12px 0 6px" }}>
              No keys yet
            </h3>
            <p className="text-muted text-sm" style={{ maxWidth: 360, margin: "0 auto 16px" }}>
              Add a Deepgram key to transcribe, and a DeepL key to translate.
            </p>
            <AddKeyDialog />
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {keys.map((k) => (
            <Card key={k.id}>
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "var(--color-surface-elevated)",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {k.provider === "DEEPGRAM" ? "Δ" : "DL"}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {k.provider === "DEEPGRAM" ? "Deepgram" : "DeepL"} · {k.label}
                      </div>
                      <div className="text-xs text-muted text-mono">•••• •••• •••• {k.last4}</div>
                    </div>
                  </div>
                  <Badge variant="success" dot>
                    Validated
                  </Badge>
                </div>
                <div className="separator" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="text-xs text-muted">
                    <Icon name="clock" size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
                    Last used {k.lastUsedAt ? formatRelative(k.lastUsedAt) : "never"}
                  </div>
                  <RevokeKeyButton id={k.id} provider={k.provider} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

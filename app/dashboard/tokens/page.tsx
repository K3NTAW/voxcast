import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui";
import { Icon } from "@/components/icon";
import { formatRelative } from "@/lib/utils";
import { MintToken } from "./_components/mint-token";
import { TokenActions } from "./_components/token-actions";

export default async function TokensPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const [tokens, profiles] = await Promise.all([
    prisma.overlayToken.findMany({
      where: { userId: session.user.id, revokedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subtitleProfile.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Overlay tokens</h1>
          <p>One token = one Browser Source URL for OBS or Meld Studio.</p>
        </div>
        <MintToken profiles={profiles} />
      </div>

      {tokens.length === 0 ? (
        <Card>
          <div style={{ padding: 48, textAlign: "center" }}>
            <Icon name="link2" size={36} className="text-faint" />
            <h3 className="text-h3" style={{ margin: "12px 0 6px" }}>
              No tokens yet
            </h3>
            <p className="text-muted text-sm" style={{ maxWidth: 360, margin: "0 auto 16px" }}>
              Mint a token to get a Browser Source URL you can paste into OBS.
            </p>
            <MintToken profiles={profiles} />
          </div>
        </Card>
      ) : (
        <Card>
          <table className="table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Pair</th>
                <th>Profile</th>
                <th>Created</th>
                <th>Last used</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id}>
                  <td>{t.label}</td>
                  <td className="text-mono text-sm">
                    {t.sourceLanguage} → {t.targetLanguage}
                  </td>
                  <td>{profiles.find((p) => p.id === t.subtitleProfileId)?.name ?? "Default"}</td>
                  <td className="text-muted text-sm">{formatRelative(t.createdAt)}</td>
                  <td className="text-muted text-sm">{t.lastUsedAt ? formatRelative(t.lastUsedAt) : "never"}</td>
                  <td style={{ textAlign: "right" }}>
                    <TokenActions id={t.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

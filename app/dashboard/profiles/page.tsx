import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui";
import { Icon } from "@/components/icon";
import { CaptionSample } from "./_components/caption-sample";

export default async function ProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const profiles = await prisma.subtitleProfile.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Profiles</h1>
          <p>Subtitle styles you can attach to any overlay token.</p>
        </div>
        <Link href="/dashboard/overlay-builder" className="btn primary">
          <Icon name="plus" size={16} /> New profile
        </Link>
      </div>
      {profiles.length === 0 ? (
        <Card>
          <div style={{ padding: 48, textAlign: "center" }}>
            <Icon name="layers" size={36} className="text-faint" />
            <h3 className="text-h3" style={{ margin: "12px 0 6px" }}>
              No profiles yet
            </h3>
            <p className="text-muted text-sm" style={{ maxWidth: 360, margin: "0 auto 16px" }}>
              Create one in the overlay builder and it'll show up here.
            </p>
            <Link href="/dashboard/overlay-builder" className="btn primary">
              Open builder
            </Link>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {profiles.map((p) => (
            <Card key={p.id}>
              <div style={{ padding: 14 }}>
                <CaptionSample profile={p as any} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="text-xs text-muted">
                      {p.fontFamily} · {p.fontSizePx}px · {p.position}
                    </div>
                  </div>
                  {p.isDefault && (
                    <Badge variant="accent">
                      <Icon name="star" size={10} /> Default
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

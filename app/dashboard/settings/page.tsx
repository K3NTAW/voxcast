import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, image: true, locale: true, theme: true, createdAt: true },
  });
  if (!user) return null;
  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Settings</h1>
          <p>Your profile, locale, theme, and data.</p>
        </div>
      </div>
      <Card>
        <div style={{ padding: 28 }}>
          <SettingsForm user={user} />
        </div>
      </Card>
    </div>
  );
}

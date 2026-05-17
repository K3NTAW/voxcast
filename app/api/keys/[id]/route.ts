import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const key = await prisma.apiKey.findFirst({ where: { id, userId: session.user.id, revokedAt: null } });
  if (!key) return Response.json({ error: "not_found" }, { status: 404 });
  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  await audit({
    userId: session.user.id,
    action: "KEY_REVOKE",
    request: req,
    metadata: { provider: key.provider, last4: key.last4 },
  });
  return Response.json({ ok: true });
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const t = await prisma.overlayToken.findFirst({ where: { id, userId: session.user.id, revokedAt: null } });
  if (!t) return Response.json({ error: "not_found" }, { status: 404 });
  await prisma.overlayToken.update({ where: { id }, data: { revokedAt: new Date() } });
  await audit({ userId: session.user.id, action: "OVERLAY_TOKEN_REVOKE", request: req, metadata: { id } });
  return Response.json({ ok: true });
}

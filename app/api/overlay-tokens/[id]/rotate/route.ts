import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { generateOverlayToken, sha256Hex } from "@/lib/crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const t = await prisma.overlayToken.findFirst({ where: { id, userId: session.user.id, revokedAt: null } });
  if (!t) return Response.json({ error: "not_found" }, { status: 404 });
  const plaintext = generateOverlayToken();
  const tokenHash = sha256Hex(plaintext);
  const next = await prisma.overlayToken.update({ where: { id }, data: { tokenHash } });
  await audit({ userId: session.user.id, action: "OVERLAY_TOKEN_MINT", request: req, metadata: { id, rotated: true } });
  return Response.json({ token: { id: next.id }, plaintext, url: `/overlay/${plaintext}` });
}

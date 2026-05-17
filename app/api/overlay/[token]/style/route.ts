// Public: resolves an overlay token to its subtitle style JSON. Token-gated.

import { prisma } from "@/lib/db";
import { sha256Hex } from "@/lib/crypto";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 8) return Response.json({ error: "invalid_token" }, { status: 400 });
  const tokenHash = sha256Hex(token);
  const overlay = await prisma.overlayToken.findFirst({
    where: { tokenHash, revokedAt: null },
    include: { subtitleProfile: true },
  });
  if (!overlay) return Response.json({ error: "not_found" }, { status: 404 });
  const profile = overlay.subtitleProfile ??
    (await prisma.subtitleProfile.findFirst({ where: { userId: overlay.userId, isDefault: true } })) ??
    (await prisma.subtitleProfile.findFirst({ where: { userId: overlay.userId } }));
  return Response.json({
    overlayTokenId: overlay.id,
    sourceLanguage: overlay.sourceLanguage,
    targetLanguage: overlay.targetLanguage,
    style: profile ?? null,
  });
}

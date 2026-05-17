import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { generateOverlayToken, sha256Hex } from "@/lib/crypto";
import { overlayTokenSchema } from "@/lib/zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const tokens = await prisma.overlayToken.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      sourceLanguage: true,
      targetLanguage: true,
      subtitleProfileId: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
  });
  return Response.json({ tokens });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = overlayTokenSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.errors[0]?.message ?? "invalid" }, { status: 400 });
  const { sourceLanguage, targetLanguage, subtitleProfileId, label } = parsed.data;

  if (subtitleProfileId) {
    const ok = await prisma.subtitleProfile.findFirst({
      where: { id: subtitleProfileId, userId: session.user.id },
      select: { id: true },
    });
    if (!ok) return Response.json({ error: "subtitleProfileId not owned" }, { status: 400 });
  }

  const plaintext = generateOverlayToken();
  const tokenHash = sha256Hex(plaintext);
  const token = await prisma.overlayToken.create({
    data: {
      userId: session.user.id,
      tokenHash,
      sourceLanguage,
      targetLanguage,
      subtitleProfileId: subtitleProfileId ?? null,
      label,
    },
    select: { id: true, label: true, createdAt: true, sourceLanguage: true, targetLanguage: true },
  });
  await audit({
    userId: session.user.id,
    action: "OVERLAY_TOKEN_MINT",
    request: req,
    metadata: { id: token.id, sourceLanguage, targetLanguage },
  });

  // Plaintext returned EXACTLY ONCE.
  return Response.json({ token, plaintext, url: `/overlay/${plaintext}` }, { status: 201 });
}

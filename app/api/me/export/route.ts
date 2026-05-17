import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const userId = session.user.id;
  const [user, apiKeys, subtitleProfiles, overlayTokens, streamSessions, auditLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        theme: true,
        createdAt: true,
      },
    }),
    prisma.apiKey.findMany({
      where: { userId },
      select: { id: true, provider: true, label: true, last4: true, createdAt: true, revokedAt: true },
    }),
    prisma.subtitleProfile.findMany({ where: { userId } }),
    prisma.overlayToken.findMany({
      where: { userId },
      select: {
        id: true,
        label: true,
        sourceLanguage: true,
        targetLanguage: true,
        createdAt: true,
        revokedAt: true,
      },
    }),
    prisma.streamSession.findMany({ where: { userId } }),
    prisma.auditLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 1000 }),
  ]);
  await audit({ userId, action: "DATA_EXPORT", request: req });

  // Convert BigInts to strings so JSON.stringify works.
  const sessions = streamSessions.map((s) => ({
    ...s,
    audioBytesIn: s.audioBytesIn?.toString() ?? null,
  }));

  return new Response(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        user,
        apiKeys,
        subtitleProfiles,
        overlayTokens,
        streamSessions: sessions,
        auditLogs,
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="voxcast-export-${Date.now()}.json"`,
      },
    },
  );
}

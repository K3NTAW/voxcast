import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Builder } from "./_components/builder";

export default async function OverlayBuilderPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const [profiles, tokens, keys] = await Promise.all([
    prisma.subtitleProfile.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.overlayToken.findMany({
      where: { userId: session.user.id, revokedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.apiKey.findMany({
      where: { userId: session.user.id, revokedAt: null },
      select: { provider: true },
    }),
  ]);
  const hasDeepgram = keys.some((k) => k.provider === "DEEPGRAM");
  const hasDeepL = keys.some((k) => k.provider === "DEEPL");

  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      <Builder
        initialProfiles={profiles as any}
        initialTokens={tokens.map((t) => ({
          id: t.id,
          label: t.label,
          sourceLanguage: t.sourceLanguage,
          targetLanguage: t.targetLanguage,
          subtitleProfileId: t.subtitleProfileId,
        }))}
        hasDeepgram={hasDeepgram}
        hasDeepL={hasDeepL}
      />
    </div>
  );
}

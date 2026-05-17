import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { sha256Hex } from "@/lib/crypto";
import { OverlayClient } from "./_components/overlay-client";

export const dynamic = "force-dynamic";

export default async function OverlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { token } = await params;
  const { debug } = await searchParams;
  const tokenHash = sha256Hex(token);
  const overlay = await prisma.overlayToken.findFirst({
    where: { tokenHash, revokedAt: null },
    include: { subtitleProfile: true },
  });
  if (!overlay) {
    return (
      <html lang="en">
        <body>
          <div style={{ color: "#fff", padding: 24 }}>Overlay token not found.</div>
        </body>
      </html>
    );
  }
  const profile =
    overlay.subtitleProfile ??
    (await prisma.subtitleProfile.findFirst({ where: { userId: overlay.userId, isDefault: true } })) ??
    (await prisma.subtitleProfile.findFirst({ where: { userId: overlay.userId } }));
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  return (
    <OverlayClient
      token={token}
      style={profile as any}
      debug={debug === "1"}
      origin={`${proto}://${host}`}
      workerWs={process.env.NEXT_PUBLIC_WORKER_WS_URL ?? "ws://localhost:8787"}
      sourceLanguage={overlay.sourceLanguage}
      targetLanguage={overlay.targetLanguage}
    />
  );
}

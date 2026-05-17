// Streamer's browser calls this right before opening the WS to the worker.
// Returns a short-lived JWT the worker can call us back with to fetch decrypted keys.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sessionStartSchema } from "@/lib/zod";
import { rateLimit } from "@/lib/rate-limit";
import { signSessionJwt } from "@/lib/worker-jwt";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const rl = await rateLimit(`session-start:${session.user.id}`, 30, 60_000);
  if (!rl.success) return Response.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = sessionStartSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.errors[0]?.message ?? "invalid" }, { status: 400 });

  const token = await prisma.overlayToken.findFirst({
    where: { id: parsed.data.overlayTokenId, userId: session.user.id, revokedAt: null },
  });
  if (!token) return Response.json({ error: "overlay_token_not_found" }, { status: 404 });

  const [deepgram, deepl] = await Promise.all([
    prisma.apiKey.findFirst({ where: { userId: session.user.id, provider: "DEEPGRAM", revokedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.apiKey.findFirst({ where: { userId: session.user.id, provider: "DEEPL", revokedAt: null }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!deepgram || !deepl) {
    return Response.json({ error: "missing_keys", needs: { deepgram: !deepgram, deepl: !deepl } }, { status: 412 });
  }

  const jwt = await signSessionJwt({
    uid: session.user.id,
    oid: token.id,
    oh: token.tokenHash,
    src: token.sourceLanguage,
    tgt: token.targetLanguage,
  });

  return Response.json({
    jwt,
    workerUrl: process.env.NEXT_PUBLIC_WORKER_WS_URL ?? "ws://localhost:8787",
    overlayTokenId: token.id,
    sourceLanguage: token.sourceLanguage,
    targetLanguage: token.targetLanguage,
  });
}

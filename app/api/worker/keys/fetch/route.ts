// Worker-internal: worker presents the streamer's JWT and we hand back decrypted keys.
// Authenticated via HS256 JWT shared with the worker.

import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { decryptSecret } from "@/lib/crypto";
import { verifySessionJwt } from "@/lib/worker-jwt";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return Response.json({ error: "missing_bearer" }, { status: 401 });

  let claims;
  try {
    claims = await verifySessionJwt(token);
  } catch {
    return Response.json({ error: "invalid_jwt" }, { status: 401 });
  }

  // Confirm token still valid, user not deleted, and the keys exist.
  const [overlayToken, deepgram, deepl] = await Promise.all([
    prisma.overlayToken.findFirst({
      where: { id: claims.oid, userId: claims.uid, revokedAt: null },
    }),
    prisma.apiKey.findFirst({
      where: { userId: claims.uid, provider: "DEEPGRAM", revokedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.apiKey.findFirst({
      where: { userId: claims.uid, provider: "DEEPL", revokedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!overlayToken) return Response.json({ error: "token_revoked" }, { status: 401 });
  if (!deepgram || !deepl) return Response.json({ error: "missing_keys" }, { status: 412 });

  const deepgramSecret = decryptSecret(deepgram.ciphertext, deepgram.iv);
  const deeplSecret = decryptSecret(deepl.ciphertext, deepl.iv);

  await Promise.all([
    prisma.apiKey.update({ where: { id: deepgram.id }, data: { lastUsedAt: new Date() } }),
    prisma.apiKey.update({ where: { id: deepl.id }, data: { lastUsedAt: new Date() } }),
    prisma.overlayToken.update({ where: { id: overlayToken.id }, data: { lastUsedAt: new Date() } }),
    audit({
      userId: claims.uid,
      action: "WORKER_KEY_FETCH",
      request: req,
      metadata: { overlayTokenId: overlayToken.id },
    }),
  ]);

  return Response.json({
    overlayTokenId: overlayToken.id,
    sourceLanguage: overlayToken.sourceLanguage,
    targetLanguage: overlayToken.targetLanguage,
    deepgramKey: deepgramSecret,
    deeplKey: deeplSecret,
  });
}

// Worker reports per-session metrics every ~30s.

import { prisma } from "@/lib/db";
import { verifySessionJwt } from "@/lib/worker-jwt";
import { z } from "zod";

const heartbeatSchema = z.object({
  startedAt: z.number().int().optional(),
  endedAt: z.number().int().optional(),
  durationSec: z.number().int().nonnegative().optional(),
  audioBytesIn: z.number().int().nonnegative().optional(),
  charsTranslated: z.number().int().nonnegative().optional(),
  deepgramReqCount: z.number().int().nonnegative().optional(),
  deeplReqCount: z.number().int().nonnegative().optional(),
  errorCount: z.number().int().nonnegative().optional(),
});

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return Response.json({ error: "missing_bearer" }, { status: 401 });

  let claims;
  try {
    claims = await verifySessionJwt(token);
  } catch {
    return Response.json({ error: "invalid_jwt" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = heartbeatSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.errors[0]?.message }, { status: 400 });

  await prisma.streamSession.create({
    data: {
      userId: claims.uid,
      overlayTokenId: claims.oid,
      sourceLanguage: claims.src,
      targetLanguage: claims.tgt,
      startedAt: parsed.data.startedAt ? new Date(parsed.data.startedAt) : new Date(),
      endedAt: parsed.data.endedAt ? new Date(parsed.data.endedAt) : null,
      durationSec: parsed.data.durationSec ?? null,
      audioBytesIn: parsed.data.audioBytesIn ? BigInt(parsed.data.audioBytesIn) : null,
      charsTranslated: parsed.data.charsTranslated ?? null,
      deepgramReqCount: parsed.data.deepgramReqCount ?? null,
      deeplReqCount: parsed.data.deeplReqCount ?? null,
      errorCount: parsed.data.errorCount ?? null,
    },
  });

  return Response.json({ ok: true });
}

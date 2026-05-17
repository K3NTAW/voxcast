import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptSecret } from "@/lib/crypto";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { apiKeySchema } from "@/lib/zod";

async function validateKey(provider: "DEEPGRAM" | "DEEPL", secret: string) {
  const ctrl = AbortSignal.timeout(5000);
  try {
    if (provider === "DEEPGRAM") {
      const res = await fetch("https://api.deepgram.com/v1/projects", {
        headers: { Authorization: `Token ${secret}` },
        signal: ctrl,
        cache: "no-store",
      });
      return res.ok;
    }
    // DeepL — both api.deepl.com (Pro) and api-free.deepl.com (Free). Try Pro first.
    const proRes = await fetch("https://api.deepl.com/v2/usage", {
      headers: { Authorization: `DeepL-Auth-Key ${secret}` },
      signal: ctrl,
      cache: "no-store",
    });
    if (proRes.ok) return true;
    const freeRes = await fetch("https://api-free.deepl.com/v2/usage", {
      headers: { Authorization: `DeepL-Auth-Key ${secret}` },
      signal: ctrl,
      cache: "no-store",
    });
    return freeRes.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: {
      id: true,
      provider: true,
      label: true,
      last4: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ keys });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const rl = await rateLimit(`keys:${session.user.id}`, 20, 60_000);
  if (!rl.success) return Response.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = apiKeySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0]?.message ?? "invalid" }, { status: 400 });
  }
  const { provider, label, secret } = parsed.data;

  const ok = await validateKey(provider, secret);
  if (!ok) return Response.json({ error: "Key rejected by provider" }, { status: 400 });

  const { ciphertext, iv, keyVersion } = encryptSecret(secret);
  const last4 = secret.slice(-4);

  try {
    const created = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        provider,
        label,
        ciphertext,
        iv,
        keyVersion,
        last4,
      },
      select: { id: true, provider: true, label: true, last4: true, createdAt: true },
    });
    await audit({
      userId: session.user.id,
      action: "KEY_CREATE",
      request: req,
      metadata: { provider, label, last4 },
    });
    return Response.json({ key: created }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return Response.json({ error: "A key with this label already exists for this provider." }, { status: 409 });
    }
    throw e;
  }
}

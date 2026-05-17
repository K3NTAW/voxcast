// Sliding-window rate limit. Upstash Redis in prod; in-memory fallback for dev.

interface Bucket {
  count: number;
  resetAt: number;
}

const memory = new Map<string, Bucket>();

function inMemoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = memory.get(key);
  if (!b || b.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetIn: windowMs };
  }
  b.count++;
  if (b.count > limit) {
    return { success: false, remaining: 0, resetIn: b.resetAt - now };
  }
  return { success: true, remaining: limit - b.count, resetIn: b.resetAt - now };
}

async function upstashLimit(key: string, limit: number, windowMs: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return inMemoryLimit(key, limit, windowMs);

  const windowSec = Math.ceil(windowMs / 1000);
  // INCR + EXPIRE pattern via Upstash REST.
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", `rl:${key}`],
        ["EXPIRE", `rl:${key}`, String(windowSec), "NX"],
      ]),
      cache: "no-store",
    });
    if (!res.ok) return inMemoryLimit(key, limit, windowMs);
    const [incr] = (await res.json()) as Array<{ result: number }>;
    const count = Number(incr.result ?? 0);
    if (count > limit) return { success: false, remaining: 0, resetIn: windowMs };
    return { success: true, remaining: limit - count, resetIn: windowMs };
  } catch {
    return inMemoryLimit(key, limit, windowMs);
  }
}

export async function rateLimit(key: string, limit: number, windowMs: number) {
  return upstashLimit(key, limit, windowMs);
}

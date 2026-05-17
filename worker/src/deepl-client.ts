// DeepL HTTP client with 10-minute response cache.

import { request, Pool } from "undici";
import { createHash } from "node:crypto";

const ALLOWED_HOSTS = ["api.deepl.com", "api-free.deepl.com"];

const TTL_MS = 10 * 60 * 1000;
interface CacheEntry {
  value: string;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
function cacheKey(text: string, src: string, tgt: string) {
  return createHash("sha256").update(`${src}::${tgt}::${text}`).digest("hex");
}

let pool: Pool | null = null;
function getPool(host: string) {
  if (!pool || pool.origin !== `https://${host}`) {
    pool = new Pool(`https://${host}`, { connections: 4, pipelining: 1 });
  }
  return pool;
}

export class DeepLClient {
  private apiKey: string;
  private host: string;
  reqCount = 0;
  charsTranslated = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Free keys end in ":fx"
    this.host = apiKey.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
    if (!ALLOWED_HOSTS.includes(this.host)) {
      throw new Error(`DeepL host not allowlisted: ${this.host}`);
    }
  }

  async translate(text: string, source: string, target: string): Promise<string> {
    if (!text.trim()) return "";
    const key = cacheKey(text, source, target);
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.value;

    const params = new URLSearchParams();
    params.set("text", text);
    params.set("target_lang", deeplTargetCode(target));
    if (source && source !== "auto") params.set("source_lang", deeplSourceCode(source));

    const pool = getPool(this.host);
    const res = await pool.request({
      path: "/v2/translate",
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      bodyTimeout: 8000,
      headersTimeout: 8000,
    });
    this.reqCount++;
    if (res.statusCode >= 400) {
      const body = await res.body.text();
      throw new Error(`DeepL ${res.statusCode}: ${body.slice(0, 200)}`);
    }
    const body = (await res.body.json()) as { translations?: Array<{ text: string }> };
    const translated = body.translations?.[0]?.text ?? text;
    this.charsTranslated += translated.length;
    cache.set(key, { value: translated, expiresAt: Date.now() + TTL_MS });
    return translated;
  }
}

// DeepL's source codes are uppercase, no region.
function deeplSourceCode(code: string): string {
  return code.split("-")[0]!.toUpperCase();
}
// Target codes preserve region for EN-US/EN-GB/PT-BR/PT-PT.
function deeplTargetCode(code: string): string {
  const upper = code.toUpperCase();
  if (["EN-US", "EN-GB", "PT-BR", "PT-PT", "ZH-HANS", "ZH-HANT"].includes(upper)) return upper;
  return upper.split("-")[0]!;
}

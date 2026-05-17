// Worker → web app calls. Allow-listed; SSRF-safe.

import { request } from "undici";

const WEB_APP_URL = process.env.WEB_APP_URL ?? "http://localhost:3000";

export interface KeyFetchResponse {
  overlayTokenId: string;
  sourceLanguage: string;
  targetLanguage: string;
  deepgramKey: string;
  deeplKey: string;
}

export async function fetchKeys(jwt: string): Promise<KeyFetchResponse> {
  const res = await request(`${WEB_APP_URL}/api/worker/keys/fetch`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    bodyTimeout: 10_000,
    headersTimeout: 10_000,
  });
  if (res.statusCode >= 400) {
    const body = await res.body.text();
    throw new Error(`web app key-fetch failed: ${res.statusCode} ${body}`);
  }
  return (await res.body.json()) as KeyFetchResponse;
}

export async function postHeartbeat(jwt: string, payload: Record<string, number | undefined>) {
  await request(`${WEB_APP_URL}/api/worker/session/heartbeat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    bodyTimeout: 10_000,
    headersTimeout: 10_000,
  }).catch((e) => console.error("heartbeat failed", e));
}

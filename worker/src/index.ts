// Voxcast audio ingest worker.
//
// /ingest?token=<jwt>   — streamer's browser opens this. Sends Opus chunks; receives caption JSON.
// /overlay?token=<plaintext> — OBS Browser Source page opens this. Receives caption JSON.
// /health               — liveness probe.

import { createServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { verifyJwt } from "./auth-jwt.js";
import { fetchKeys, postHeartbeat } from "./web-app.js";
import { DeepgramClient } from "./deepgram-client.js";
import { DeepLClient } from "./deepl-client.js";
import { subscribe, publish, subscriberCount } from "./broadcast.js";

const PORT = Number(process.env.WORKER_PORT ?? 8787);
const startedAtMs = Date.now();

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, uptime: Date.now() - startedAtMs }));
    return;
  }
  res.writeHead(404).end();
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (req, socket, head) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const token = url.searchParams.get("token");
  if (!token) {
    socket.destroy();
    return;
  }
  if (url.pathname === "/ingest") {
    // Ingest needs JWT verification (and stays open as the streamer's audio pipe).
    let claims;
    try {
      claims = await verifyJwt(token);
    } catch {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => handleIngest(ws, token, claims!));
    return;
  }
  if (url.pathname === "/overlay") {
    // No JWT here — the overlay carries only the plaintext URL token. We derive
    // the channel key as sha256(plaintext), which matches the ingest's claims.oh.
    // Overlay only carries the plaintext overlay token; we use it as the channel key.
    wss.handleUpgrade(req, socket, head, (ws) => handleOverlay(ws, token));
    return;
  }
  socket.destroy();
});

async function handleIngest(
  ws: WebSocket,
  jwt: string,
  claims: { uid: string; oid: string; oh: string; src: string; tgt: string },
) {
  let keys;
  try {
    keys = await fetchKeys(jwt);
  } catch (err: any) {
    ws.send(JSON.stringify({ type: "error", message: "key_fetch_failed", detail: String(err.message ?? err) }));
    ws.close();
    return;
  }
  const startMs = Date.now();
  let audioBytes = 0;
  let dgReqs = 0;
  let errors = 0;
  const deepl = new DeepLClient(keys.deeplKey);

  let lastTranslateAt = 0;
  let pendingFinalText: string | null = null;

  const broadcastCaption = async (text: string, isFinal: boolean) => {
    // Translate finals always; throttle interims.
    if (!isFinal && Date.now() - lastTranslateAt < 250) return;
    try {
      const translated = await deepl.translate(text, claims.src, claims.tgt);
      publish(claims.oh, {
        type: "caption",
        text: translated,
        original: text,
        isFinal,
        ts: Date.now(),
      });
      ws.send(JSON.stringify({ type: "caption", text: translated, isFinal }));
      lastTranslateAt = Date.now();
    } catch (e: any) {
      errors++;
      console.error("translate failed", e?.message);
      ws.send(JSON.stringify({ type: "error", message: "translate_failed" }));
    }
  };

  const dg = new DeepgramClient({
    apiKey: keys.deepgramKey,
    sourceLanguage: claims.src,
    onTranscript: (text, isFinal) => {
      dgReqs++;
      if (isFinal) pendingFinalText = text;
      broadcastCaption(text, isFinal);
    },
    onError: (err) => {
      errors++;
      console.error("deepgram error", err.message);
      try {
        ws.send(JSON.stringify({ type: "error", message: "deepgram_error" }));
      } catch {}
    },
    onClose: () => {
      try {
        ws.send(JSON.stringify({ type: "deepgram_closed" }));
      } catch {}
    },
  });
  dg.open();

  ws.send(
    JSON.stringify({
      type: "ready",
      overlayTokenId: claims.oid,
      sourceLanguage: claims.src,
      targetLanguage: claims.tgt,
      overlaySubscribers: subscriberCount(claims.oh),
    }),
  );

  ws.on("message", (data, isBinary) => {
    if (isBinary) {
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
      audioBytes += buf.byteLength;
      dg.sendAudio(buf);
    }
    // Browser may send JSON control messages; ignore unknown.
  });

  const heartbeat = setInterval(() => {
    postHeartbeat(jwt, {
      startedAt: startMs,
      durationSec: Math.floor((Date.now() - startMs) / 1000),
      audioBytesIn: audioBytes,
      charsTranslated: deepl.charsTranslated,
      deepgramReqCount: dgReqs,
      deeplReqCount: deepl.reqCount,
      errorCount: errors,
    });
  }, 30_000);

  ws.on("close", () => {
    clearInterval(heartbeat);
    dg.close();
    postHeartbeat(jwt, {
      startedAt: startMs,
      endedAt: Date.now(),
      durationSec: Math.floor((Date.now() - startMs) / 1000),
      audioBytesIn: audioBytes,
      charsTranslated: deepl.charsTranslated,
      deepgramReqCount: dgReqs,
      deeplReqCount: deepl.reqCount,
      errorCount: errors,
    });
  });
}

import { createHash } from "node:crypto";

function sha256Hex(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

async function handleOverlay(ws: WebSocket, plaintextToken: string) {
  // Channel key = sha256(plaintext). Matches claims.oh on the ingest side
  // (which the web app signs from OverlayToken.tokenHash, also sha256 of plaintext).
  const channel = sha256Hex(plaintextToken);
  subscribe(channel, ws);
  ws.send(JSON.stringify({ type: "hello", channel: channel.slice(0, 8) }));
  ws.on("message", () => {
    // overlays don't send anything meaningful
  });
}

server.listen(PORT, () => {
  console.log(`voxcast worker listening on :${PORT}`);
});

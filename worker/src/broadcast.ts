// In-memory fan-out keyed by overlayTokenId. Each ingest session pushes captions
// to all subscribed overlay clients.

import type { WebSocket } from "ws";

const channels = new Map<string, Set<WebSocket>>();

export function subscribe(overlayTokenId: string, ws: WebSocket) {
  let set = channels.get(overlayTokenId);
  if (!set) {
    set = new Set();
    channels.set(overlayTokenId, set);
  }
  set.add(ws);
  ws.on("close", () => {
    set?.delete(ws);
    if (set && set.size === 0) channels.delete(overlayTokenId);
  });
}

export function publish(overlayTokenId: string, payload: object) {
  const set = channels.get(overlayTokenId);
  if (!set) return 0;
  const data = JSON.stringify(payload);
  let count = 0;
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(data);
        count++;
      } catch {
        set.delete(ws);
      }
    }
  }
  return count;
}

export function subscriberCount(overlayTokenId: string) {
  return channels.get(overlayTokenId)?.size ?? 0;
}

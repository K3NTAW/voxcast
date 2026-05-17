// Streaming Deepgram client. Pipes audio in, emits transcript events out.

import WebSocket from "ws";

const ALLOWED_HOST = "api.deepgram.com";

export interface DeepgramOptions {
  apiKey: string;
  sourceLanguage: string; // "en-US", "auto" supported
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (err: Error) => void;
  onClose: () => void;
}

export class DeepgramClient {
  private ws: WebSocket | null = null;
  private opts: DeepgramOptions;
  private closed = false;

  constructor(opts: DeepgramOptions) {
    this.opts = opts;
  }

  open() {
    const params = new URLSearchParams({
      model: "nova-2-general",
      smart_format: "true",
      interim_results: "true",
      endpointing: "300",
      utterance_end_ms: "1000",
      encoding: "opus", // browser MediaRecorder emits webm/opus; Deepgram accepts opus
      sample_rate: "16000",
      channels: "1",
    });
    if (this.opts.sourceLanguage && this.opts.sourceLanguage !== "auto") {
      params.set("language", this.opts.sourceLanguage);
    } else {
      params.set("detect_language", "true");
    }
    const url = `wss://${ALLOWED_HOST}/v1/listen?${params.toString()}`;
    this.ws = new WebSocket(url, {
      headers: { Authorization: `Token ${this.opts.apiKey}` },
    });
    this.ws.on("open", () => {
      // Send a keepalive every 5s.
      const keepalive = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "KeepAlive" }));
        } else {
          clearInterval(keepalive);
        }
      }, 5000);
    });
    this.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "Results") {
          const t = msg.channel?.alternatives?.[0]?.transcript;
          if (typeof t === "string" && t.trim().length > 0) {
            this.opts.onTranscript(t, !!msg.is_final);
          }
        }
      } catch {
        // ignore
      }
    });
    this.ws.on("error", (err) => this.opts.onError(err));
    this.ws.on("close", () => {
      if (!this.closed) this.opts.onClose();
    });
  }

  sendAudio(buf: ArrayBuffer | Buffer) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(Buffer.isBuffer(buf) ? buf : Buffer.from(buf));
  }

  close() {
    this.closed = true;
    try {
      this.ws?.send(JSON.stringify({ type: "CloseStream" }));
    } catch {}
    try {
      this.ws?.close();
    } catch {}
  }
}

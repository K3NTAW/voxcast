"use client";

import { useEffect, useRef, useState } from "react";
import { captionToCss, alignFromPosition, type CaptionStyle } from "@/components/caption";

export function OverlayClient({
  token,
  style,
  debug,
  origin,
  workerWs,
  sourceLanguage,
  targetLanguage,
}: {
  token: string;
  style: CaptionStyle | null;
  debug: boolean;
  origin: string;
  workerWs: string;
  sourceLanguage: string;
  targetLanguage: string;
}) {
  const [caption, setCaption] = useState<string>("");
  const [shown, setShown] = useState(false);
  const [status, setStatus] = useState<"connecting" | "connected" | "reconnecting" | "error">("connecting");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number>(0);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    function connect() {
      if (cancelled) return;
      const url = `${workerWs.replace(/\/$/, "")}/overlay?token=${encodeURIComponent(token)}`;
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onopen = () => {
          setStatus("connected");
          reconnectRef.current = 0;
        };
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(typeof e.data === "string" ? e.data : "");
            if (msg.type === "caption") {
              setCaption(msg.text ?? "");
              setShown(true);
              if (holdRef.current) clearTimeout(holdRef.current);
              const hold = (style?.holdMs ?? 1500) + (style?.fadeMs ?? 150);
              holdRef.current = setTimeout(() => setShown(false), hold);
            }
            if (msg.type === "stats") setLatencyMs(msg.latencyMs ?? null);
          } catch {}
        };
        ws.onclose = () => {
          if (cancelled) return;
          setStatus("reconnecting");
          reconnectRef.current += 1;
          const delay = Math.min(30_000, 500 * Math.pow(2, reconnectRef.current));
          setTimeout(connect, delay + Math.random() * 400);
        };
        ws.onerror = () => setStatus("error");
      } catch {
        setStatus("error");
      }
    }
    connect();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [token, workerWs, style?.holdMs, style?.fadeMs]);

  const css = style ? captionToCss(style) : {};
  const align = alignFromPosition(style?.position ?? "bottom");

  return (
    <html lang="en">
      <head>
        <title>Overlay</title>
        <style>{`html,body{margin:0;background:transparent;height:100%;overflow:hidden;}`}</style>
      </head>
      <body className={debug ? "overlay-page overlay-page--debug" : "overlay-page"}>
        {debug && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "rgba(255,255,255,.6)",
              fontSize: 11,
              fontFamily: "ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span>OBS Browser Source · {origin}</span>
              <span>·</span>
              <span>
                {sourceLanguage} → {targetLanguage}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background:
                      status === "connected" ? "#34d399" : status === "error" ? "#f87171" : "#fbbf24",
                    boxShadow:
                      status === "connected" ? "0 0 8px #34d399" : "none",
                  }}
                />
                {status}
              </span>
              {latencyMs != null && <span>p50 {latencyMs}ms</span>}
            </div>
          </div>
        )}
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: align,
            padding: style?.marginPx ?? 48,
            pointerEvents: "none",
          }}
        >
          {style && (
            <span
              style={{
                ...css,
                opacity: shown ? 1 : 0,
                transition: `opacity ${style.fadeMs ?? 150}ms cubic-bezier(.2,.8,.2,1)`,
              }}
            >
              {caption || (debug ? "(waiting for captions…)" : "")}
            </span>
          )}
        </div>
      </body>
    </html>
  );
}

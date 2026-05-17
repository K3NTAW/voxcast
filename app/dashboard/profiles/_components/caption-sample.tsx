"use client";

import { captionToCss, type CaptionStyle, alignFromPosition } from "@/components/caption";

export function CaptionSample({ profile }: { profile: CaptionStyle }) {
  return (
    <div className="caption-stage-mock" style={{ aspectRatio: "16 / 9" }}>
      <div className="safe-area" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: alignFromPosition(profile.position),
          padding: Math.min(profile.marginPx, 28),
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            ...captionToCss({
              ...profile,
              fontSizePx: Math.max(14, Math.min(profile.fontSizePx, 26)),
            }),
          }}
        >
          Hola, ¿qué tal?
        </span>
      </div>
    </div>
  );
}

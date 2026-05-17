import type { CSSProperties } from "react";

export interface CaptionStyle {
  fontFamily: string;
  fontWeight: number;
  fontSizePx: number;
  lineHeight: number;
  letterSpacingEm: number;
  textColor: string;
  textStrokeColor: string;
  textStrokePx: number;
  textShadow?: string | null;
  textAlign: string;
  textCase: string;
  bgMode: string;
  bgColor: string;
  bgPaddingX: number;
  bgPaddingY: number;
  bgRadiusPx: number;
  bgBlurPx: number;
  position: string;
  maxWidthPct: number;
  marginPx: number;
  fadeMs: number;
  holdMs: number;
  maxLines: number;
}

export function captionToCss(s: CaptionStyle): CSSProperties {
  const bg =
    s.bgMode === "transparent"
      ? "transparent"
      : s.bgMode === "blur"
        ? s.bgColor || "rgba(0,0,0,0.35)"
        : s.bgColor || "rgba(0,0,0,0.65)";
  return {
    fontFamily: `${s.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
    fontWeight: s.fontWeight,
    fontSize: s.fontSizePx,
    lineHeight: s.lineHeight,
    letterSpacing: `${s.letterSpacingEm}em`,
    color: s.textColor,
    textAlign: s.textAlign as CSSProperties["textAlign"],
    textTransform: (s.textCase === "upper" ? "uppercase" : s.textCase === "lower" ? "lowercase" : "none") as CSSProperties["textTransform"],
    background: bg,
    padding: `${s.bgPaddingY}px ${s.bgPaddingX}px`,
    borderRadius: s.bgRadiusPx,
    WebkitTextStroke: s.textStrokePx > 0 ? `${s.textStrokePx}px ${s.textStrokeColor}` : "0",
    textShadow: s.textShadow ?? "none",
    backdropFilter: s.bgMode === "blur" ? `blur(${s.bgBlurPx}px)` : "none",
    maxWidth: `${s.maxWidthPct}%`,
    display: "inline-block",
  };
}

export function alignFromPosition(position: string): CSSProperties["alignItems"] {
  if (position === "top") return "flex-start";
  if (position === "center") return "center";
  return "flex-end";
}

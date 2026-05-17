import { z } from "zod";

export const ALLOWED_FONTS = [
  "Inter",
  "Roboto",
  "Roboto Mono",
  "Noto Sans",
  "Noto Sans JP",
  "Noto Sans KR",
  "Open Sans",
  "Montserrat",
  "Source Sans 3",
  "Atkinson Hyperlegible",
  "JetBrains Mono",
] as const;

export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/);

export const subtitleProfileSchema = z.object({
  name: z.string().min(1).max(60),
  isDefault: z.boolean().optional(),
  fontFamily: z.enum(ALLOWED_FONTS).optional(),
  fontWeight: z.number().int().min(100).max(900).optional(),
  fontSizePx: z.number().int().min(12).max(160).optional(),
  lineHeight: z.number().min(0.8).max(3).optional(),
  letterSpacingEm: z.number().min(-0.05).max(0.2).optional(),
  textColor: hexColor.optional(),
  textStrokeColor: hexColor.optional(),
  textStrokePx: z.number().int().min(0).max(12).optional(),
  textShadow: z.string().max(120).nullable().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  textCase: z.enum(["none", "upper", "lower"]).optional(),
  bgMode: z.enum(["transparent", "solid", "gradient", "blur"]).optional(),
  bgColor: hexColor.optional(),
  bgPaddingX: z.number().int().min(0).max(80).optional(),
  bgPaddingY: z.number().int().min(0).max(80).optional(),
  bgRadiusPx: z.number().int().min(0).max(64).optional(),
  bgBlurPx: z.number().int().min(0).max(40).optional(),
  position: z.enum(["top", "center", "bottom"]).optional(),
  maxWidthPct: z.number().int().min(20).max(100).optional(),
  marginPx: z.number().int().min(0).max(200).optional(),
  fadeMs: z.number().int().min(0).max(500).optional(),
  holdMs: z.number().int().min(0).max(4000).optional(),
  maxLines: z.number().int().min(1).max(4).optional(),
});

export const apiKeySchema = z.object({
  provider: z.enum(["DEEPGRAM", "DEEPL"]),
  label: z.string().min(1).max(60).default("Default"),
  secret: z.string().min(8).max(512),
});

export const overlayTokenSchema = z.object({
  label: z.string().min(1).max(60).default("OBS Overlay"),
  sourceLanguage: z.string().min(2).max(16),
  targetLanguage: z.string().min(2).max(16),
  subtitleProfileId: z.string().cuid().nullable().optional(),
});

export const sessionStartSchema = z.object({
  overlayTokenId: z.string().cuid(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  locale: z.enum(["en", "es", "de", "fr", "ja", "pt-BR", "ko"]).optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

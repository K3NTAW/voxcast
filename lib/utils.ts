import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelative(d: Date | string | null | undefined): string {
  if (!d) return "never";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return date.toISOString().slice(0, 10);
}

export function formatDuration(sec: number | null | undefined): string {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${sec}s`;
}

export const DEEPL_LANGS = [
  { code: "es", native: "Español", english: "Spanish" },
  { code: "ja", native: "日本語", english: "Japanese" },
  { code: "ko", native: "한국어", english: "Korean" },
  { code: "pt-BR", native: "Português (BR)", english: "Portuguese (Brazil)" },
  { code: "fr", native: "Français", english: "French" },
  { code: "de", native: "Deutsch", english: "German" },
  { code: "zh", native: "中文", english: "Chinese" },
  { code: "id", native: "Bahasa Indonesia", english: "Indonesian" },
  { code: "ar", native: "العربية", english: "Arabic" },
  { code: "en-US", native: "English (US)", english: "English (US)" },
  { code: "en-GB", native: "English (UK)", english: "English (UK)" },
  { code: "it", native: "Italiano", english: "Italian" },
  { code: "nl", native: "Nederlands", english: "Dutch" },
  { code: "pl", native: "Polski", english: "Polish" },
  { code: "ru", native: "Русский", english: "Russian" },
  { code: "tr", native: "Türkçe", english: "Turkish" },
];

export const SOURCE_LANGS = [
  { code: "en-US", native: "English (US)", english: "English (US)" },
  { code: "es", native: "Español", english: "Spanish" },
  { code: "ja", native: "日本語", english: "Japanese" },
  { code: "ko", native: "한국어", english: "Korean" },
  { code: "pt-BR", native: "Português (BR)", english: "Portuguese (Brazil)" },
  { code: "fr", native: "Français", english: "French" },
  { code: "de", native: "Deutsch", english: "German" },
  { code: "auto", native: "Auto-detect", english: "Auto-detect" },
];

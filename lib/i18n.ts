// Minimal i18n helper. Pre-loads message files; expand to next-intl middleware in M7.

import en from "@/messages/en.json";
import es from "@/messages/es.json";
import ja from "@/messages/ja.json";

const messages: Record<string, typeof en> = {
  en,
  es: es as typeof en,
  ja: ja as typeof en,
};

export type Messages = typeof en;
export const SUPPORTED_LOCALES = ["en", "es", "de", "fr", "ja", "pt-BR", "ko"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function getMessages(locale: string): Messages {
  return messages[locale] ?? messages.en;
}

export function t(locale: string, key: string): string {
  const m = getMessages(locale) as any;
  return key.split(".").reduce((acc, k) => (acc && typeof acc === "object" ? acc[k] : undefined), m) ?? key;
}

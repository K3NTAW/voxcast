import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voxcast — Live Stream Translation",
  description: "Real-time translation for live streams. BYOK Deepgram + DeepL. OBS browser source.",
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
};

// Self-hosted fonts: per PLANNING.md §10 we ship Inter / JetBrains Mono via
// next/font/local. For dev/build without those .woff2 files present, we fall
// back to system fonts via the CSS variables in globals.css. Drop .woff2 files
// in /public/fonts/ and enable next/font/local imports here when ready.

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth().catch(() => null);
  const theme = session?.user?.theme ?? "dark";
  return (
    <html lang="en" className={theme === "light" ? "light" : ""}>
      <body>{children}</body>
    </html>
  );
}

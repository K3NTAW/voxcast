"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
  { value: "pt-BR", label: "Português (BR)" },
  { value: "ko", label: "한국어" },
] as const;

export function SettingsForm({
  user,
}: {
  user: { id: string; name: string | null; email: string | null; locale: string; theme: string; createdAt: Date };
}) {
  const [name, setName] = useState(user.name ?? "");
  const [locale, setLocale] = useState(user.locale);
  const [theme, setTheme] = useState(user.theme);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function save() {
    start(async () => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, locale, theme }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1600);
        document.documentElement.classList.toggle("light", theme === "light");
        router.refresh();
      }
    });
  }

  async function exportData() {
    window.open("/api/me/export", "_blank");
  }
  async function destroy() {
    if (!confirm("Delete your account? We hold your data for 7 days, then it's gone.")) return;
    const res = await fetch("/api/me", { method: "DELETE" });
    if (res.ok) router.push("/");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="label">Email</label>
          <input className="input" value={user.email ?? ""} disabled />
        </div>
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="label">Language</label>
          <select className="select" value={locale} onChange={(e) => setLocale(e.target.value)}>
            {LOCALES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Theme</label>
          <div className="segmented" role="radiogroup">
            {(["light", "dark"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
                {t === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="primary" loading={pending} onClick={save}>
          Save
        </Button>
        {saved && <span className="text-sm text-muted">Saved · just now</span>}
      </div>
      <div className="separator" />
      <div>
        <h3 className="text-h3" style={{ marginTop: 0 }}>
          Data
        </h3>
        <p className="text-muted text-sm" style={{ marginTop: 0 }}>
          Download or delete your account.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" iconLeft="download" onClick={exportData}>
            Export JSON
          </Button>
          <Button variant="destructive" iconLeft="trash" onClick={destroy}>
            Delete account
          </Button>
        </div>
      </div>
    </div>
  );
}

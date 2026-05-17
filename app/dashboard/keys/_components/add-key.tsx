"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icon";

export function AddKeyDialog() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<"DEEPGRAM" | "DEEPL">("DEEPGRAM");
  const [label, setLabel] = useState("Default");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, label, secret }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Failed (${res.status})`);
      }
      setSecret("");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Failed to add key");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="primary" iconLeft="plus" onClick={() => setOpen(true)}>
        Add key
      </Button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: 480, maxWidth: "92%", padding: 28 }}
          >
            <h2 className="text-h2" style={{ margin: "0 0 6px" }}>
              Add API key
            </h2>
            <p className="text-muted text-sm" style={{ margin: "0 0 20px" }}>
              We validate the key with the provider, then encrypt it with AES-256-GCM. Plaintext is never logged.
            </p>
            <form onSubmit={onSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label">Provider</label>
                  <div className="segmented" role="radiogroup">
                    {(["DEEPGRAM", "DEEPL"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-pressed={provider === p}
                        onClick={() => setProvider(p)}
                      >
                        {p === "DEEPGRAM" ? "Deepgram" : "DeepL"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="key-label">
                    Label
                  </label>
                  <input
                    id="key-label"
                    className="input"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    maxLength={60}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="key-secret">
                    Key
                  </label>
                  <input
                    id="key-secret"
                    className="input mono"
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder={provider === "DEEPGRAM" ? "Deepgram API token" : "DeepL Auth-Key:fx"}
                    required
                  />
                  <div className="helper">
                    {provider === "DEEPGRAM"
                      ? "Get a key at console.deepgram.com → API Keys."
                      : "Get a key at deepl.com → Pro account → API key."}
                  </div>
                </div>
                {err && (
                  <div className="badge danger" style={{ padding: "6px 10px" }}>
                    <Icon name="alertTriangle" size={12} /> {err}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={() => setOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={loading}>
                  Validate & save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, CodeBlock } from "@/components/ui";
import { Icon } from "@/components/icon";
import { SOURCE_LANGS, DEEPL_LANGS } from "@/lib/utils";

export function MintToken({ profiles }: { profiles: Array<{ id: string; name: string }> }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("OBS Overlay");
  const [src, setSrc] = useState("en-US");
  const [tgt, setTgt] = useState("es");
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [minted, setMinted] = useState<{ url: string; plaintext: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onMint(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/overlay-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          sourceLanguage: src,
          targetLanguage: tgt,
          subtitleProfileId: profileId || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed");
      }
      const j = await res.json();
      const base = typeof window !== "undefined" ? window.location.origin : "";
      setMinted({ url: `${base}${j.url}`, plaintext: j.plaintext });
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    setMinted(null);
  }

  return (
    <>
      <Button variant="primary" iconLeft="plus" onClick={() => setOpen(true)}>
        Mint token
      </Button>
      {open && (
        <div
          onClick={close}
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
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 520, maxWidth: "92%", padding: 28 }}>
            {minted ? (
              <>
                <h2 className="text-h2" style={{ margin: "0 0 6px" }}>
                  Token minted
                </h2>
                <p className="text-muted text-sm" style={{ margin: "0 0 20px" }}>
                  Copy this URL into OBS Browser Source. We only show it once.
                </p>
                <CodeBlock value={minted.url} />
                <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
                  <Button variant="primary" onClick={close}>
                    Done
                  </Button>
                </div>
              </>
            ) : (
              <form onSubmit={onMint}>
                <h2 className="text-h2" style={{ margin: "0 0 6px" }}>
                  Mint overlay token
                </h2>
                <p className="text-muted text-sm" style={{ margin: "0 0 20px" }}>
                  Each token is a unique URL. Pair it with one profile and one language pair.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label className="label">Label</label>
                    <input
                      className="input"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      maxLength={60}
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className="label">Source</label>
                      <select className="select" value={src} onChange={(e) => setSrc(e.target.value)}>
                        {SOURCE_LANGS.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.code} · {l.native}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Target</label>
                      <select className="select" value={tgt} onChange={(e) => setTgt(e.target.value)}>
                        {DEEPL_LANGS.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.code} · {l.native}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Profile</label>
                    <select className="select" value={profileId} onChange={(e) => setProfileId(e.target.value)}>
                      <option value="">Default</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {err && (
                    <div className="badge danger" style={{ padding: "6px 10px" }}>
                      <Icon name="alertTriangle" size={12} /> {err}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
                  <Button variant="ghost" type="button" onClick={close}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" loading={loading}>
                    Mint
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, CodeBlock } from "@/components/ui";

export function TokenActions({ id }: { id: string }) {
  const router = useRouter();
  const [rotated, setRotated] = useState<{ url: string } | null>(null);

  async function rotate() {
    if (!confirm("Rotate this token? The old URL stops working immediately.")) return;
    const res = await fetch(`/api/overlay-tokens/${id}/rotate`, { method: "POST" });
    if (res.ok) {
      const j = await res.json();
      const base = typeof window !== "undefined" ? window.location.origin : "";
      setRotated({ url: `${base}${j.url}` });
      router.refresh();
    }
  }
  async function revoke() {
    if (!confirm("Revoke this token? OBS will lose the overlay until you mint a new one.")) return;
    await fetch(`/api/overlay-tokens/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <Button size="sm" variant="ghost" iconLeft="rotateCw" onClick={rotate}>
        Rotate
      </Button>
      <Button size="sm" variant="ghost" iconLeft="trash" onClick={revoke}>
        Revoke
      </Button>
      {rotated && (
        <div
          onClick={() => setRotated(null)}
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
            style={{ width: 520, maxWidth: "92%", padding: 28 }}
          >
            <h2 className="text-h2" style={{ margin: "0 0 6px" }}>
              Rotated
            </h2>
            <p className="text-muted text-sm" style={{ margin: "0 0 18px" }}>
              Update OBS with the new URL.
            </p>
            <CodeBlock value={rotated.url} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <Button variant="primary" onClick={() => setRotated(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

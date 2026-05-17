"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Badge, LiveIndicator, LatencyMeter, Waveform } from "@/components/ui";
import { Icon } from "@/components/icon";
import { captionToCss, type CaptionStyle, alignFromPosition } from "@/components/caption";
import { ALLOWED_FONTS } from "@/lib/zod";

type Profile = CaptionStyle & { id: string; name: string; isDefault: boolean };
type Token = {
  id: string;
  label: string;
  sourceLanguage: string;
  targetLanguage: string;
  subtitleProfileId: string | null;
};

const SAMPLE_PHRASES = [
  { en: "Welcome back to the stream.", es: "Bienvenidos de nuevo al directo." },
  { en: "We just hit a new sub goal!", es: "¡Acabamos de alcanzar una nueva meta!" },
  { en: "Let's run it back, GG.", es: "Vamos a la revancha, GG." },
];

export function Builder({
  initialProfiles,
  initialTokens,
  hasDeepgram,
  hasDeepL,
}: {
  initialProfiles: Profile[];
  initialTokens: Token[];
  hasDeepgram: boolean;
  hasDeepL: boolean;
}) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [activeId, setActiveId] = useState<string | null>(profiles[0]?.id ?? null);
  const [tokens] = useState<Token[]>(initialTokens);
  const [tokenId, setTokenId] = useState<string | null>(initialTokens[0]?.id ?? null);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const active = profiles.find((p) => p.id === activeId) ?? null;

  // Live caption state
  const [live, setLive] = useState(false);
  const [caption, setCaption] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (live) return;
    const id = setInterval(() => setPhraseIdx((p) => (p + 1) % SAMPLE_PHRASES.length), 2400);
    return () => clearInterval(id);
  }, [live]);

  function updateActive(patch: Partial<Profile>) {
    if (!active) return;
    const next = { ...active, ...patch } as Profile;
    setProfiles((ps) => ps.map((p) => (p.id === active.id ? next : p)));
    debouncedSave(next);
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function debouncedSave(p: Profile) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await fetch(`/api/subtitle-profiles/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fontFamily: p.fontFamily,
          fontWeight: p.fontWeight,
          fontSizePx: p.fontSizePx,
          lineHeight: p.lineHeight,
          letterSpacingEm: p.letterSpacingEm,
          textColor: p.textColor,
          textStrokeColor: p.textStrokeColor,
          textStrokePx: p.textStrokePx,
          textAlign: p.textAlign,
          textCase: p.textCase,
          bgMode: p.bgMode,
          bgColor: p.bgColor,
          bgPaddingX: p.bgPaddingX,
          bgPaddingY: p.bgPaddingY,
          bgRadiusPx: p.bgRadiusPx,
          bgBlurPx: p.bgBlurPx,
          position: p.position,
          maxWidthPct: p.maxWidthPct,
          marginPx: p.marginPx,
          fadeMs: p.fadeMs,
          holdMs: p.holdMs,
          maxLines: p.maxLines,
        }),
      });
      setSavedAt(Date.now());
    }, 350);
  }

  async function startLive() {
    setErr(null);
    if (!tokenId) {
      setErr("Mint an overlay token first (Tokens page).");
      return;
    }
    if (!hasDeepgram || !hasDeepL) {
      setErr("Add Deepgram and DeepL keys first.");
      return;
    }
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overlayTokenId: tokenId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "session_start_failed");
      }
      const { jwt, workerUrl } = await res.json();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const wsUrl = `${workerUrl.replace(/^http/, "ws").replace(/\/$/, "")}/ingest`;
      const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(jwt)}`);
      wsRef.current = ws;
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
        const mr = new MediaRecorder(stream, { mimeType: mime });
        mediaRef.current = mr;
        mr.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            e.data.arrayBuffer().then((buf) => ws.send(buf));
          }
        };
        mr.start(100);
        setLive(true);
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(typeof e.data === "string" ? e.data : "");
          if (msg.type === "caption") setCaption(msg.text ?? "");
        } catch {}
      };
      ws.onclose = () => stopLive();
      ws.onerror = () => setErr("Worker connection failed");
    } catch (e: any) {
      setErr(e.message);
    }
  }

  function stopLive() {
    try {
      mediaRef.current?.stop();
      mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
    } catch {}
    try {
      wsRef.current?.close();
    } catch {}
    setLive(false);
  }

  const overlayUrl = useMemo(() => {
    return typeof window !== "undefined" && tokenId
      ? `${window.location.origin}/overlay/${tokenId.slice(0, 8)}…`
      : "";
  }, [tokenId]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", height: "100%", gap: 0 }}>
      <aside style={{ borderRight: "1px solid var(--color-border)", overflow: "auto", padding: 20 }}>
        <h2 className="text-h3" style={{ marginTop: 0 }}>
          Style editor
        </h2>
        {!active ? (
          <p className="text-muted text-sm">No profile selected.</p>
        ) : (
          <StyleEditor profile={active} onChange={updateActive} />
        )}
      </aside>
      <section style={{ position: "relative", overflow: "auto", padding: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <LiveIndicator live={live} language={profiles.find((p) => p.id === activeId)?.fontFamily ? "es" : "—"} />
          {live && <LatencyMeter />}
          {live && <Waveform />}
          <div style={{ flex: 1 }} />
          <select
            className="select"
            value={tokenId ?? ""}
            onChange={(e) => setTokenId(e.target.value || null)}
            style={{ width: "auto", height: 32 }}
          >
            <option value="">No token</option>
            {tokens.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.sourceLanguage}→{t.targetLanguage})
              </option>
            ))}
          </select>
          {!live ? (
            <Button variant="primary" iconLeft="mic" onClick={startLive}>
              Start session
            </Button>
          ) : (
            <Button variant="destructive" iconLeft="square" onClick={stopLive}>
              Stop
            </Button>
          )}
        </div>
        {err && (
          <div className="badge danger" style={{ marginBottom: 12, padding: "6px 10px" }}>
            <Icon name="alertTriangle" size={12} /> {err}
          </div>
        )}
        {active && (
          <div className="caption-stage-mock" style={{ aspectRatio: "16 / 9" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: alignFromPosition(active.position),
                padding: active.marginPx,
                pointerEvents: "none",
              }}
            >
              <span style={captionToCss(active)}>
                {live
                  ? caption || "Listening…"
                  : (active.fontFamily.includes("Mono") ? SAMPLE_PHRASES[phraseIdx].en : SAMPLE_PHRASES[phraseIdx].es)}
              </span>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
          <input className="input mono" readOnly value={overlayUrl} style={{ flex: 1 }} />
          <Badge variant="neutral">
            <Icon name="info" size={12} /> Full URL in Tokens
          </Badge>
        </div>
        {savedAt && (
          <div className="text-xs text-muted" style={{ marginTop: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: "var(--color-success)", display: "inline-block", marginRight: 6 }} />
            Saved · just now
          </div>
        )}
      </section>
    </div>
  );
}

function StyleEditor({ profile, onChange }: { profile: Profile; onChange: (p: Partial<Profile>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Font family">
        <select
          className="select"
          value={profile.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
        >
          {ALLOWED_FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Field>
      <Range label="Size" value={profile.fontSizePx} min={12} max={120} unit="px" onChange={(v) => onChange({ fontSizePx: v })} />
      <Range label="Weight" value={profile.fontWeight} min={300} max={900} step={100} onChange={(v) => onChange({ fontWeight: v })} />
      <Range label="Line height" value={profile.lineHeight} min={0.8} max={2} step={0.05} onChange={(v) => onChange({ lineHeight: v })} />
      <Color label="Text color" value={profile.textColor} onChange={(v) => onChange({ textColor: v })} />
      <Color label="Stroke color" value={profile.textStrokeColor} onChange={(v) => onChange({ textStrokeColor: v })} />
      <Range label="Stroke width" value={profile.textStrokePx} min={0} max={12} unit="px" onChange={(v) => onChange({ textStrokePx: v })} />
      <Field label="Alignment">
        <div className="segmented">
          {(["left", "center", "right"] as const).map((a) => (
            <button key={a} type="button" aria-pressed={profile.textAlign === a} onClick={() => onChange({ textAlign: a })}>
              {a[0]?.toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
      </Field>
      <div className="separator" />
      <Field label="Background mode">
        <div className="segmented">
          {(["transparent", "solid", "blur"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={profile.bgMode === m} onClick={() => onChange({ bgMode: m })}>
              {m[0]?.toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </Field>
      {profile.bgMode !== "transparent" && (
        <Color label="Background color" value={profile.bgColor} onChange={(v) => onChange({ bgColor: v })} />
      )}
      <Range label="Pad X" value={profile.bgPaddingX} min={0} max={80} unit="px" onChange={(v) => onChange({ bgPaddingX: v })} />
      <Range label="Pad Y" value={profile.bgPaddingY} min={0} max={80} unit="px" onChange={(v) => onChange({ bgPaddingY: v })} />
      <Range label="Radius" value={profile.bgRadiusPx} min={0} max={32} unit="px" onChange={(v) => onChange({ bgRadiusPx: v })} />
      <div className="separator" />
      <Field label="Position">
        <div className="segmented">
          {(["top", "center", "bottom"] as const).map((p) => (
            <button key={p} type="button" aria-pressed={profile.position === p} onClick={() => onChange({ position: p })}>
              {p[0]?.toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </Field>
      <Range label="Margin" value={profile.marginPx} min={0} max={200} unit="px" onChange={(v) => onChange({ marginPx: v })} />
      <Range label="Max width" value={profile.maxWidthPct} min={30} max={100} unit="%" onChange={(v) => onChange({ maxWidthPct: v })} />
      <div className="separator" />
      <Range label="Fade" value={profile.fadeMs} min={0} max={500} unit="ms" onChange={(v) => onChange({ fadeMs: v })} />
      <Range label="Hold" value={profile.holdMs} min={0} max={4000} step={100} unit="ms" onChange={(v) => onChange({ holdMs: v })} />
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field
      label={
        <>
          {label}{" "}
          <span className="text-muted text-xs text-tnum">
            {value}
            {unit ?? ""}
          </span>
        </>
      }
    >
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={value.length >= 7 ? value.slice(0, 7) : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 36, height: 36, padding: 0, border: "1px solid var(--color-border)", borderRadius: 6 }}
        />
        <input
          className="input mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
          maxLength={9}
        />
      </div>
    </Field>
  );
}

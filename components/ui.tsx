"use client";

import { Icon, type IconName } from "./icon";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export function Button({
  variant = "secondary",
  size = "md",
  iconLeft,
  iconRight,
  loading,
  className,
  children,
  ...rest
}: {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg";
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("btn", variant, size, className)} {...rest}>
      {loading && (
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
      )}
      {!loading && iconLeft && <Icon name={iconLeft} size={size === "sm" ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16} />}
    </button>
  );
}

export function Badge({
  variant = "neutral",
  dot,
  children,
}: {
  variant?: "neutral" | "accent" | "live" | "success" | "warning" | "danger";
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("badge", variant)}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function Card({
  elevated,
  className,
  children,
  style,
}: {
  elevated?: boolean;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("card", elevated && "elevated", className)} style={style}>
      {children}
    </div>
  );
}

export function Switch({ value, onChange, ...rest }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!value}
      data-on={value ? "1" : "0"}
      className="switch"
      onClick={() => onChange(!value)}
      {...(rest as any)}
    >
      <i />
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<T | { value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => {
        const v = typeof o === "object" ? o.value : o;
        const l = typeof o === "object" ? o.label : o;
        return (
          <button key={v} type="button" role="radio" aria-pressed={v === value} onClick={() => onChange(v)}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function CodeBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="codeblock">
      <span className="code">{value}</span>
      <button className="copy" onClick={handle} type="button">
        <Icon name={copied ? "check" : "copy"} size={12} />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function LiveIndicator({ live, language }: { live: boolean; language: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Badge variant={live ? "live" : "neutral"} dot={live}>
        {live ? "LIVE" : "OFFLINE"}
      </Badge>
      <span className="badge neutral" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
        {language}
      </span>
    </div>
  );
}

export function Waveform({ color }: { color?: string }) {
  return (
    <span className="waveform" style={{ color: color ?? "var(--color-success)" }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <i key={i} className="bar" />
      ))}
    </span>
  );
}

export function LatencyMeter({ speed = 1 }: { speed?: number }) {
  const N = 28;
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: N }, () => 280 + Math.random() * 220),
  );
  useEffect(() => {
    if (speed === 0) return;
    const id = setInterval(
      () => {
        setBars((prev) => {
          const next = prev.slice(1);
          next.push(220 + Math.random() * 360 + (Math.random() < 0.05 ? 200 : 0));
          return next;
        });
      },
      Math.max(140, 900 / Math.max(0.2, speed)),
    );
    return () => clearInterval(id);
  }, [speed]);
  const sorted = [...bars].sort((a, b) => a - b);
  const p50 = Math.round(sorted[Math.floor(N * 0.5)] || 0);
  const p95 = Math.round(sorted[Math.floor(N * 0.95)] || 0);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 22 }} aria-label={`Latency p50 ${p50}ms`}>
        {bars.map((v, i) => {
          const h = Math.max(2, Math.min(22, (v / 900) * 22));
          let color = "var(--color-success)";
          if (v > 600) color = "var(--color-warning)";
          if (v > 800) color = "var(--color-danger)";
          return <span key={i} style={{ width: 4, height: h, background: color, borderRadius: 1 }} />;
        })}
      </div>
      <div style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span className="text-xs text-tnum">
          <strong style={{ fontWeight: 600 }}>{p50}</strong>
          <span className="text-faint"> p50</span>
        </span>
        <span className="text-xs text-tnum text-muted">
          {p95} <span className="text-faint">p95</span>
        </span>
      </div>
    </div>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      iconLeft={copied ? "check" : "copy"}
      onClick={async () => {
        try {
          await navigator.clipboard?.writeText(value);
        } catch {}
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

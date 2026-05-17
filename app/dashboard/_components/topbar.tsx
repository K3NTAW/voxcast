"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { signOut } from "next-auth/react";

const LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/overlay-builder": "Overlay builder",
  "/dashboard/profiles": "Profiles",
  "/dashboard/keys": "Keys",
  "/dashboard/tokens": "Tokens",
  "/dashboard/sessions": "Sessions",
  "/dashboard/settings": "Settings",
};

export function Topbar({ user }: { user: { name: string | null; email: string | null; image: string | null } }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = ["/dashboard", pathname].filter((p, i, a) => a.indexOf(p) === i);
  const initial = (user.name ?? user.email ?? "U").charAt(0).toUpperCase();
  return (
    <header className="topbar">
      <div className="crumbs">
        {crumbs.map((p, i) => (
          <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <Icon name="chevronRight" size={12} />}
            <span style={{ color: i === crumbs.length - 1 ? "var(--color-text)" : undefined }}>
              {LABELS[p] ?? segments.at(-1) ?? "—"}
            </span>
          </span>
        ))}
      </div>
      <div className="spacer" />
      <button
        className="btn ghost icon-only sm"
        onClick={() => signOut({ callbackUrl: "/" })}
        title="Sign out"
        aria-label="Sign out"
      >
        <Icon name="logOut" size={14} />
      </button>
      <div className="avatar" title={user.email ?? undefined}>
        {initial}
      </div>
    </header>
  );
}

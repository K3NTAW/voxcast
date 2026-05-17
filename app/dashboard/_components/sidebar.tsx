"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";

const NAV: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/dashboard", label: "Overview", icon: "layoutDashboard" },
  { href: "/dashboard/overlay-builder", label: "Overlay builder", icon: "sliders" },
  { href: "/dashboard/profiles", label: "Profiles", icon: "layers" },
  { href: "/dashboard/keys", label: "Keys", icon: "key" },
  { href: "/dashboard/tokens", label: "Tokens", icon: "link2" },
  { href: "/dashboard/sessions", label: "Sessions", icon: "history" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export function Sidebar({ user }: { user: { name: string | null; email: string | null; image: string | null } }) {
  const pathname = usePathname();
  const initial = (user.name ?? user.email ?? "U").charAt(0).toUpperCase();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link href="/dashboard" className="wordmark">
          Voxcast
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("nav-item", active && "active")}>
              <Icon name={item.icon} size={18} />
              <span className="label">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="sidebar-foot">
        <div className="nav-item" style={{ height: 40 }}>
          <div className="avatar" style={{ width: 24, height: 24, fontSize: 11 }}>
            {initial}
          </div>
          <div className="label" style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name ?? user.email ?? "User"}</span>
            <span className="text-xs text-faint">Beta · Free</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

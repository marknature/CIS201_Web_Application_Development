"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, CalendarDays, Users, Clock, LogOut, Cpu } from "lucide-react";

const NAV = [
  { href: "/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/roster",         label: "Roster Board",   icon: CalendarDays },
  { href: "/leave",          label: "Leave",          icon: LogOut },
  { href: "/overtime",       label: "Overtime",       icon: Clock },
  { href: "/drivers",        label: "Drivers",        icon: Users },
  { href: "/skill-matching", label: "Skill Matching", icon: Cpu },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside
      style={{ width: 220, background: "#1A1A1A", display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0 }}
    >
      {/* Logo / Brand */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "#CC0000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, color: "#fff", letterSpacing: 1,
          }}>
            FF
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>FFIMS</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>Workforce Scheduling</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                background: active ? "#CC0000" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0, color: active ? "#fff" : "rgba(255,255,255,0.45)" }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#CC0000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>
            S
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Supervisor</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Africa University FFU</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

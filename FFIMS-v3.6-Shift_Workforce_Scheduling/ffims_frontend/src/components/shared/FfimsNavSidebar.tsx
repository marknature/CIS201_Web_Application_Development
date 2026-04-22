
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard, CalendarDays, Users, Clock,
  LogOut, Cpu, MapPin, Ticket, Route,
} from "lucide-react";

const NAV = [
  { href: "/Shift_Workforce_Scheduling/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/Shift_Workforce_Scheduling/roster",         label: "Roster Board",   icon: CalendarDays },
  { href: "/Shift_Workforce_Scheduling/leave",          label: "Leave",          icon: LogOut },
  { href: "/Shift_Workforce_Scheduling/overtime",       label: "Overtime",       icon: Clock },
  { href: "/Shift_Workforce_Scheduling/drivers",        label: "Drivers",        icon: Users },
  { href: "/Shift_Workforce_Scheduling/skill-matching", label: "Skill Matching", icon: Cpu },
  { href: "/Shift_Workforce_Scheduling/journeys",       label: "Journeys",       icon: Route },
  { href: "/Shift_Workforce_Scheduling/allowances",     label: "Allowances",     icon: Ticket },
  { href: "/Shift_Workforce_Scheduling/map",            label: "Live Map",       icon: MapPin },
];

export default function FfimsNavSidebar() {
  const router = useRouter();
  const path = router.pathname;

  return (
    <aside style={{ width: 220, background: "#1A1A1A", display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0, overflowY: "auto" }}>
      {/* Brand */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#CC0000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff", letterSpacing: 1, flexShrink: 0 }}>
            FF
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>FFIMS</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>Workforce Scheduling</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Section label */}
        {NAV.map(({ href, label, icon: Icon }, i) => {
          const active = path === href || path.startsWith(href + "/");
          // Section dividers
          const dividerBefore = i === 6; // before Journeys group
          return (
            <div key={href}>
              {dividerBefore && (
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 4px" }} />
              )}
              <Link
                href={href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 6, fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  background: active ? "#CC0000" : "transparent",
                  textDecoration: "none", transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Icon style={{ width: 15, height: 15, flexShrink: 0, color: active ? "#fff" : "rgba(255,255,255,0.4)" }} />
                {label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#CC0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            S
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Supervisor</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Africa University FFU</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

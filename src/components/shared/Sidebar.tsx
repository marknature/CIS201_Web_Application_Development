"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard, CalendarDays, Users, Clock, LogOut,
  Briefcase, Cpu,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",       label: "Dashboard",      icon: LayoutDashboard },
  { href: "/roster",          label: "Roster Board",   icon: CalendarDays },
  { href: "/leave",           label: "Leave",          icon: LogOut },
  { href: "/overtime",        label: "Overtime",       icon: Clock },
  { href: "/drivers",         label: "Drivers",        icon: Users },
  { href: "/skill-matching",  label: "Skill Matching", icon: Cpu },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white px-3 py-4">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D9E75]">
          <Briefcase className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none text-gray-900">FFIMS</p>
          <p className="text-[10px] text-gray-400">Workforce Scheduling</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-[#E1F5EE] text-[#0F6E56] font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E1F5EE] text-xs font-medium text-[#0F6E56]">
            S
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-gray-900">Supervisor</p>
            <p className="truncate text-[10px] text-gray-400">Africa University FFU</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

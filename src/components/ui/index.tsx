import { ShiftType, LeaveStatus, OvertimeStatus } from "@/types";
import { clsx } from "clsx";

// ── Badge ──────────────────────────────────────────────────────────────
const SHIFT_STYLES: Record<ShiftType, string> = {
  duty:    "bg-[#E1F5EE] text-[#085041] border border-[#5DCAA5]",
  standby: "bg-[#E6F1FB] text-[#0C447C] border border-[#85B7EB]",
  leave:   "bg-[#FAECE7] text-[#712B13] border border-[#F0997B]",
  rest:    "bg-[#F1EFE8] text-[#444441] border border-[#B4B2A9]",
  ot:      "bg-[#FAEEDA] text-[#633806] border border-[#EF9F27]",
};

const SHIFT_LABELS: Record<ShiftType, string> = {
  duty: "Bus Assign", standby: "Standby", leave: "Leave", rest: "Rest", ot: "Overtime",
};

export function ShiftBadge({ type, className }: { type: ShiftType; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", SHIFT_STYLES[type], className)}>
      {SHIFT_LABELS[type]}
    </span>
  );
}

// ── Leave status badge ─────────────────────────────────────────────────
const LEAVE_STYLES: Record<LeaveStatus, string> = {
  pending:  "bg-[#FAEEDA] text-[#633806]",
  approved: "bg-[#E1F5EE] text-[#085041]",
  rejected: "bg-[#FCEBEB] text-[#791F1F]",
};

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span className={clsx("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize", LEAVE_STYLES[status])}>
      {status}
    </span>
  );
}

// ── OT status badge ────────────────────────────────────────────────────
const OT_STYLES: Record<OvertimeStatus, string> = {
  proposed: "bg-[#E6F1FB] text-[#0C447C]",
  accepted: "bg-[#E1F5EE] text-[#085041]",
  declined: "bg-[#FCEBEB] text-[#791F1F]",
};

export function OTStatusBadge({ status }: { status: OvertimeStatus }) {
  return (
    <span className={clsx("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize", OT_STYLES[status])}>
      {status}
    </span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-xl border border-gray-200 bg-white p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────
export function KPICard({
  label, value, sub, accent,
}: { label: string; value: string | number; sub?: string; accent?: "green" | "amber" | "blue" | "red" }) {
  const accents = {
    green: "text-[#0F6E56]",
    amber: "text-[#BA7517]",
    blue:  "text-[#185FA5]",
    red:   "text-[#A32D2D]",
  };
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={clsx("mt-1 text-2xl font-medium", accent ? accents[accent] : "text-gray-900")}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ── Section heading ────────────────────────────────────────────────────
export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-lg font-medium text-gray-900">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

// ── Team badge ─────────────────────────────────────────────────────────
export function TeamBadge({ team }: { team: "A" | "B" }) {
  return (
    <span className={clsx("ml-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium",
      team === "A" ? "bg-[#E1F5EE] text-[#085041]" : "bg-[#E6F1FB] text-[#0C447C]"
    )}>
      Team {team}
    </span>
  );
}

import { ShiftType, LeaveStatus, OvertimeStatus } from "@/types";
import { clsx } from "clsx";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";

// ── Shift chip ─────────────────────────────────────────────────────────
const CHIP_CLASS: Record<ShiftType, string> = {
  duty:    "chip chip-duty",
  standby: "chip chip-standby",
  leave:   "chip chip-leave",
  rest:    "chip chip-rest",
  ot:      "chip chip-ot",
};
const CHIP_LABEL: Record<ShiftType, string> = {
  duty: "On Duty", standby: "Standby", leave: "Leave", rest: "Rest", ot: "Overtime",
};

export function ShiftChip({ type, className }: { type: ShiftType; className?: string }) {
  return <span className={clsx(CHIP_CLASS[type], className)}>{CHIP_LABEL[type]}</span>;
}

// ── Leave status chip ──────────────────────────────────────────────────
const LEAVE_CLASS: Record<LeaveStatus, string> = {
  pending:  "chip bg-yellow-100 text-yellow-800",
  approved: "chip chip-duty",
  rejected: "chip chip-ot",
};
export function LeaveChip({ status }: { status: LeaveStatus }) {
  return <span className={LEAVE_CLASS[status]}>{status}</span>;
}

// ── OT status chip ─────────────────────────────────────────────────────
const OT_CLASS: Record<OvertimeStatus, string> = {
  proposed: "chip chip-standby",
  accepted: "chip chip-duty",
  declined: "chip chip-ot",
};
export function OTChip({ status }: { status: OvertimeStatus }) {
  return <span className={OT_CLASS[status]}>{status}</span>;
}

// ── KPI Card — red left accent per design framework ────────────────────
export function KPICard({
  label, value, sub, variant = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const valueColor: Record<string, string> = {
    default: "text-[#1A1A1A]",
    success: "text-[#166534]",
    warning: "text-[#854D0E]",
    danger:  "text-[#991B1B]",
    info:    "text-[#1E40AF]",
  };
  return (
    <div className="card accent-left flex flex-col gap-1">
      <p style={{ fontSize: 12, color: "#6B7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700 }} className={valueColor[variant]}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#9CA3AF" }}>{sub}</p>}
    </div>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("card", className)}>{children}</div>;
}

// ── Page heading ───────────────────────────────────────────────────────
export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-page-title">{title}</h1>
      {subtitle && <p className="mt-1 text-body" style={{ color: "#6B7280" }}>{subtitle}</p>}
    </div>
  );
}

// ── Section label ──────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-section mb-3">{children}</h2>
  );
}

// ── Compliance alert row ───────────────────────────────────────────────
export function ComplianceRow({ severity, message }: { severity: "error" | "warning"; message: string }) {
  if (severity === "error") return (
    <div className="flex items-start gap-2 rounded-md px-3 py-2 text-xs font-medium" style={{ background: "#FEE2E2", color: "#991B1B" }}>
      <XCircle style={{ width: 14, height: 14, marginTop: 1, flexShrink: 0 }} />
      {message}
    </div>
  );
  return (
    <div className="flex items-start gap-2 rounded-md px-3 py-2 text-xs font-medium" style={{ background: "#FEF9C3", color: "#854D0E" }}>
      <AlertTriangle style={{ width: 14, height: 14, marginTop: 1, flexShrink: 0 }} />
      {message}
    </div>
  );
}

// ── Team badge ─────────────────────────────────────────────────────────
export function TeamBadge({ team }: { team: "A" | "B" }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "1px 6px",
      borderRadius: 3, marginLeft: 6,
      background: team === "A" ? "#FEE2E2" : "#DBEAFE",
      color: team === "A" ? "#991B1B" : "#1E40AF",
    }}>
      Team {team}
    </span>
  );
}

// ── Avatar initials ────────────────────────────────────────────────────
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#1A1A1A", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size < 36 ? 11 : 13, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── Approve / Reject button pair ───────────────────────────────────────
export function ApproveRejectButtons({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={onApprove} className="btn btn-success btn-sm">
        <CheckCircle style={{ width: 13, height: 13 }} /> Approve
      </button>
      <button onClick={onReject} className="btn btn-danger btn-sm">
        <XCircle style={{ width: 13, height: 13 }} /> Reject
      </button>
    </div>
  );
}

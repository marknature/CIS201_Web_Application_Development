"use client";
import { useFFIMSStore } from "@/store/ffims";
import { KPICard, PageHeading, ShiftChip, ComplianceRow, Card } from "@/components/ui";
import { DRIVERS } from "@/lib/data";
import { getWeeklyHours } from "@/lib/compliance";
import { CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const { roster, violations, compliancePct, fairness, leaveRequests, overtimeRecords } = useFFIMSStore();

  const today = 3;
  const onDuty    = DRIVERS.filter((d) => roster.roster[d.id]?.[today]?.type === "duty").length;
  const standby   = DRIVERS.filter((d) => roster.roster[d.id]?.[today]?.type === "standby").length;
  const onLeave   = leaveRequests.filter((l) => l.status === "approved").length;
  const otHours   = DRIVERS.reduce((a, d) => a + (roster.roster[d.id] ?? []).filter((s) => s.type === "ot").length * 4, 0);
  const pendLeave = leaveRequests.filter((l) => l.status === "pending").length;
  const pendOT    = overtimeRecords.filter((o) => o.status === "proposed").length;
  const errors    = violations.filter((v) => v.severity === "error");
  const warnings  = violations.filter((v) => v.severity === "warning");

  return (
    <div>
      <PageHeading title="Dashboard" subtitle="Shift & Workforce Scheduling — Africa University Fleet & Facilities Unit" />

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        <KPICard label="On duty today"    value={onDuty}              variant="success" />
        <KPICard label="Standby today"    value={standby}             variant="info" />
        <KPICard label="On approved leave" value={onLeave}            variant="warning" />
        <KPICard label="OT hours (week)"  value={`${otHours}h`}       variant="warning" />
        <KPICard label="Compliance"       value={`${compliancePct}%`} variant={compliancePct >= 95 ? "success" : "danger"} />
        <KPICard label="Fairness index"   value={`${fairness}/100`}   variant={fairness >= 80 ? "success" : "warning"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Compliance panel */}
        <Card>
          <h2 className="text-section mb-3">Compliance engine</h2>
          {violations.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#166534" }}>
              <CheckCircle style={{ width: 16, height: 16 }} />
              All shifts comply with Zimbabwe Labor Act regulations.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {errors.map((v, i) => <ComplianceRow key={i} severity="error" message={v.message} />)}
              {warnings.map((v, i) => <ComplianceRow key={i} severity="warning" message={v.message} />)}
            </div>
          )}
        </Card>

        {/* Pending actions */}
        <Card>
          <h2 className="text-section mb-3">Pending actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Leave requests", count: pendLeave, bg: "#FEF9C3", color: "#854D0E" },
              { label: "OT approvals",   count: pendOT,    bg: "#DBEAFE", color: "#1E40AF" },
              { label: "Compliance issues", count: violations.length, bg: violations.length ? "#FEE2E2" : "#DCFCE7", color: violations.length ? "#991B1B" : "#166534" },
            ].map(({ label, count, bg, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9FAFB", borderRadius: 6, padding: "8px 12px" }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, background: bg, color, padding: "2px 8px", borderRadius: 12 }}>{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Driver availability table */}
      <Card>
        <h2 className="text-section mb-3">Driver status — Thursday</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="ffims-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Team</th>
                <th>License</th>
                <th>Status today</th>
                <th style={{ textAlign: "right" }}>Week hrs</th>
              </tr>
            </thead>
            <tbody>
              {DRIVERS.map((d) => {
                const todayShift = roster.roster[d.id]?.[today];
                const hrs = getWeeklyHours(roster.roster[d.id] ?? []);
                return (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500, color: "#1A1A1A" }}>{d.name}</td>
                    <td>Team {d.team}</td>
                    <td>{d.licenseClass}</td>
                    <td>{todayShift && <ShiftChip type={todayShift.type} />}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: hrs >= 45 ? "#991B1B" : hrs >= 42 ? "#854D0E" : "#374151" }}>
                      {hrs}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

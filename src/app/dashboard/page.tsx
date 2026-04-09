"use client";
import { useFFIMSStore } from "@/store/ffims";
import { KPICard, SectionHeading, ShiftBadge, Card } from "@/components/ui";
import { DRIVERS } from "@/lib/data";
import { getWeeklyHours } from "@/lib/compliance";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function DashboardPage() {
  const { roster, violations, compliancePct, fairness, leaveRequests, overtimeRecords } = useFFIMSStore();

  const today = 3; // Thu = index 3 in Mon-Sun week
  const onDutyToday   = DRIVERS.filter((d) => roster.roster[d.id]?.[today]?.type === "duty").length;
  const standbyToday  = DRIVERS.filter((d) => roster.roster[d.id]?.[today]?.type === "standby").length;
  const onLeaveCount  = leaveRequests.filter((l) => l.status === "approved").length;
  const weeklyOtHours = DRIVERS.reduce((acc, d) => acc + (roster.roster[d.id] ?? []).filter((s) => s.type === "ot").length * 4, 0);
  const pendingLeave  = leaveRequests.filter((l) => l.status === "pending").length;
  const pendingOt     = overtimeRecords.filter((o) => o.status === "proposed").length;

  const errors   = violations.filter((v) => v.severity === "error");
  const warnings = violations.filter((v) => v.severity === "warning");

  return (
    <div>
      <SectionHeading
        title="Dashboard"
        subtitle="Shift & Workforce Scheduling — Africa University FFU"
      />

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KPICard label="On duty today"     value={onDutyToday}       accent="green" />
        <KPICard label="Standby today"     value={standbyToday}      accent="blue"  />
        <KPICard label="On approved leave" value={onLeaveCount}       accent="amber" />
        <KPICard label="OT hours (week)"   value={`${weeklyOtHours}h`} accent="amber" />
        <KPICard label="Compliance"        value={`${compliancePct}%`} accent={compliancePct >= 95 ? "green" : "amber"} />
        <KPICard label="Fairness index"    value={`${fairness}/100`}   accent={fairness >= 80 ? "green" : "amber"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Compliance panel */}
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium text-gray-900">Compliance engine</h2>
          {violations.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-[#0F6E56]">
              <CheckCircle className="h-4 w-4" />
              All shifts comply with Zimbabwe Labor Act regulations.
            </div>
          ) : (
            <div className="space-y-2">
              {errors.map((v, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-[#FCEBEB] px-3 py-2 text-xs text-[#791F1F]">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  {v.message}
                </div>
              ))}
              {warnings.map((v, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-[#FAEEDA] px-3 py-2 text-xs text-[#633806]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  {v.message}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending actions */}
        <Card>
          <h2 className="mb-3 text-sm font-medium text-gray-900">Pending actions</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-600">Leave requests</span>
              <span className="rounded-full bg-[#FAEEDA] px-2 py-0.5 text-xs font-medium text-[#633806]">{pendingLeave}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-600">OT approvals</span>
              <span className="rounded-full bg-[#E6F1FB] px-2 py-0.5 text-xs font-medium text-[#0C447C]">{pendingOt}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-600">Compliance issues</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${violations.length === 0 ? "bg-[#E1F5EE] text-[#085041]" : "bg-[#FCEBEB] text-[#791F1F]"}`}>{violations.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Driver availability table */}
      <Card className="mt-4">
        <h2 className="mb-3 text-sm font-medium text-gray-900">Driver status today (Thursday)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-left font-medium text-gray-500">Driver</th>
                <th className="pb-2 text-left font-medium text-gray-500">Team</th>
                <th className="pb-2 text-left font-medium text-gray-500">License</th>
                <th className="pb-2 text-left font-medium text-gray-500">Today</th>
                <th className="pb-2 text-right font-medium text-gray-500">Week hrs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DRIVERS.map((d) => {
                const todayShift = roster.roster[d.id]?.[today];
                const hrs = getWeeklyHours(roster.roster[d.id] ?? []);
                return (
                  <tr key={d.id} className="py-1">
                    <td className="py-2 font-medium text-gray-900">{d.name}</td>
                    <td className="py-2 text-gray-500">Team {d.team}</td>
                    <td className="py-2 text-gray-500">{d.licenseClass}</td>
                    <td className="py-2">{todayShift && <ShiftBadge type={todayShift.type} />}</td>
                    <td className={`py-2 text-right font-medium ${hrs >= 45 ? "text-[#A32D2D]" : hrs >= 42 ? "text-[#BA7517]" : "text-gray-600"}`}>{hrs}h</td>
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

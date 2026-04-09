"use client";
import { useFFIMSStore } from "@/store/ffims";
import { SectionHeading, Card, OTStatusBadge } from "@/components/ui";
import { DRIVERS } from "@/lib/data";
import { overtimeFairnessRanking } from "@/lib/skillMatch";
import { CheckCircle, XCircle } from "lucide-react";

export default function OvertimePage() {
  const { overtimeRecords, approveOvertime, declineOvertime, drivers } = useFFIMSStore();
  const ranked = overtimeFairnessRanking(drivers);
  const pending  = overtimeRecords.filter((o) => o.status === "proposed");
  const resolved = overtimeRecords.filter((o) => o.status !== "proposed");

  return (
    <div>
      <SectionHeading title="Overtime Management" subtitle="Fair distribution · Zimbabwe Labor Act compliance · 1.5× standard rate" />

      {/* Pending OT */}
      <h2 className="mb-2 text-sm font-medium text-gray-700">Pending approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="mb-4 text-sm text-gray-400">No pending overtime requests.</p>
      ) : (
        <div className="mb-6 space-y-2">
          {pending.map((ot) => (
            <Card key={ot.id} className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-gray-900">{ot.driverName}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {ot.date} · {ot.hours}h @ {ot.rate}× · {ot.reason}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  Estimated pay: {(ot.hours * ot.rate).toFixed(1)}× base rate
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => approveOvertime(ot.id)} className="flex items-center gap-1.5 rounded-lg bg-[#E1F5EE] px-3 py-1.5 text-xs font-medium text-[#085041] hover:bg-[#5DCAA5]/20 transition-colors">
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </button>
                <button onClick={() => declineOvertime(ot.id)} className="flex items-center gap-1.5 rounded-lg bg-[#FCEBEB] px-3 py-1.5 text-xs font-medium text-[#791F1F] hover:bg-[#F09595]/20 transition-colors">
                  <XCircle className="h-3.5 w-3.5" /> Decline
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fairness ranking */}
      <h2 className="mb-2 text-sm font-medium text-gray-700">OT fairness ranking</h2>
      <p className="mb-3 text-xs text-gray-400">Priority: fewest recent OT hours → highest seniority</p>
      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Rank</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Driver</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Team</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Recent OT hrs</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Seniority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ranked.map((d, i) => (
              <tr key={d.id} className={i === 0 ? "bg-[#E1F5EE]/40" : "hover:bg-gray-50/40"}>
                <td className="px-4 py-2 font-medium text-gray-400">#{i + 1}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{d.name}</td>
                <td className="px-4 py-2 text-gray-500">Team {d.team}</td>
                <td className="px-4 py-2 text-right text-gray-700">{d.recentOtHours}h</td>
                <td className="px-4 py-2 text-right text-gray-700">{d.seniorityYears}y</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History */}
      {resolved.length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-medium text-gray-700">History</h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Driver</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Hours</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Reason</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {resolved.map((ot) => (
                  <tr key={ot.id} className="hover:bg-gray-50/40">
                    <td className="px-4 py-2 font-medium text-gray-900">{ot.driverName}</td>
                    <td className="px-4 py-2 text-gray-500">{ot.date}</td>
                    <td className="px-4 py-2 text-gray-500">{ot.hours}h</td>
                    <td className="px-4 py-2 text-gray-500">{ot.reason}</td>
                    <td className="px-4 py-2"><OTStatusBadge status={ot.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

"use client";
import { useFFIMSStore } from "@/store/ffims";
import { SectionHeading, Card, LeaveStatusBadge } from "@/components/ui";
import { CheckCircle, XCircle } from "lucide-react";

export default function LeavePage() {
  const { leaveRequests, approveLeave, rejectLeave } = useFFIMSStore();

  const pending  = leaveRequests.filter((l) => l.status === "pending");
  const reviewed = leaveRequests.filter((l) => l.status !== "pending");

  return (
    <div>
      <SectionHeading title="Leave Management" subtitle="Review and approve employee leave requests" />

      {/* Pending */}
      <h2 className="mb-2 text-sm font-medium text-gray-700">Pending approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="mb-4 text-sm text-gray-400">No pending leave requests.</p>
      ) : (
        <div className="mb-6 space-y-2">
          {pending.map((lr) => (
            <Card key={lr.id} className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-gray-900">{lr.driverName}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {lr.startDate} → {lr.endDate} · {lr.reason}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-400">Submitted {new Date(lr.submittedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => approveLeave(lr.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#E1F5EE] px-3 py-1.5 text-xs font-medium text-[#085041] hover:bg-[#5DCAA5]/20 transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  onClick={() => rejectLeave(lr.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#FCEBEB] px-3 py-1.5 text-xs font-medium text-[#791F1F] hover:bg-[#F09595]/20 transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* History */}
      <h2 className="mb-2 text-sm font-medium text-gray-700">History ({reviewed.length})</h2>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Driver</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Dates</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Reason</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Reviewed by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reviewed.map((lr) => (
              <tr key={lr.id} className="hover:bg-gray-50/40">
                <td className="px-4 py-2 font-medium text-gray-900">{lr.driverName}</td>
                <td className="px-4 py-2 text-gray-500">{lr.startDate} → {lr.endDate}</td>
                <td className="px-4 py-2 text-gray-500">{lr.reason}</td>
                <td className="px-4 py-2"><LeaveStatusBadge status={lr.status} /></td>
                <td className="px-4 py-2 text-gray-400">{lr.reviewedBy ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

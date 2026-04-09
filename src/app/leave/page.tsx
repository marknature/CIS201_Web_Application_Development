"use client";
import { useFFIMSStore } from "@/store/ffims";
import { PageHeading, LeaveChip, ApproveRejectButtons, Card } from "@/components/ui";

export default function LeavePage() {
  const { leaveRequests, approveLeave, rejectLeave } = useFFIMSStore();
  const pending  = leaveRequests.filter((l) => l.status === "pending");
  const reviewed = leaveRequests.filter((l) => l.status !== "pending");

  return (
    <div>
      <PageHeading title="Leave Management" subtitle="Review and approve employee leave requests" />

      {/* Pending */}
      <h2 className="text-section mb-3">Pending approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>No pending leave requests.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {pending.map((lr) => (
            <Card key={lr.id}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>{lr.driverName}</p>
                  <p style={{ fontSize: 13, color: "#6B7280" }}>
                    {lr.startDate} → {lr.endDate} &nbsp;·&nbsp; {lr.reason}
                  </p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                    Submitted {new Date(lr.submittedAt).toLocaleDateString("en-ZW", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <ApproveRejectButtons onApprove={() => approveLeave(lr.id)} onReject={() => rejectLeave(lr.id)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* History table */}
      <h2 className="text-section mb-3">History ({reviewed.length})</h2>
      <Card style={{ padding: 0, overflowX: "auto" }}>
        <table className="ffims-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Date range</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Reviewed by</th>
            </tr>
          </thead>
          <tbody>
            {reviewed.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#9CA3AF", padding: 24 }}>No records yet.</td></tr>
            ) : reviewed.map((lr) => (
              <tr key={lr.id}>
                <td style={{ fontWeight: 500, color: "#1A1A1A" }}>{lr.driverName}</td>
                <td>{lr.startDate} → {lr.endDate}</td>
                <td>{lr.reason}</td>
                <td><LeaveChip status={lr.status} /></td>
                <td style={{ color: "#9CA3AF" }}>{lr.reviewedBy ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

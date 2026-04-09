"use client";
import { useFFIMSStore } from "@/store/ffims";
import { PageHeading, OTChip, ApproveRejectButtons, Card } from "@/components/ui";
import { overtimeFairnessRanking } from "@/lib/skillMatch";

export default function OvertimePage() {
  const { overtimeRecords, approveOvertime, declineOvertime, drivers } = useFFIMSStore();
  const ranked   = overtimeFairnessRanking(drivers);
  const pending  = overtimeRecords.filter((o) => o.status === "proposed");
  const resolved = overtimeRecords.filter((o) => o.status !== "proposed");

  return (
    <div>
      <PageHeading title="Overtime Management" subtitle="Fair distribution · Zimbabwe Labor Act compliance · 1.5× standard rate" />

      {/* Pending */}
      <h2 className="text-section mb-3">Pending approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>No pending overtime requests.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {pending.map((ot) => (
            <Card key={ot.id}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>{ot.driverName}</p>
                  <p style={{ fontSize: 13, color: "#6B7280" }}>
                    {ot.date} &nbsp;·&nbsp; {ot.hours}h @ {ot.rate}× rate &nbsp;·&nbsp; {ot.reason}
                  </p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                    Est. multiplier: {(ot.hours * ot.rate).toFixed(1)}× base rate
                  </p>
                </div>
                <ApproveRejectButtons onApprove={() => approveOvertime(ot.id)} onReject={() => declineOvertime(ot.id)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fairness ranking */}
      <h2 className="text-section mb-1">OT fairness ranking</h2>
      <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>Algorithm: fewest recent OT hours → highest seniority → skill match</p>
      <Card style={{ padding: 0, overflowX: "auto", marginBottom: 24 }}>
        <table className="ffims-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>Rank</th>
              <th>Driver</th>
              <th>Team</th>
              <th style={{ textAlign: "right" }}>Recent OT hrs</th>
              <th style={{ textAlign: "right" }}>Seniority</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((d, i) => (
              <tr key={d.id} style={{ background: i === 0 ? "#FEF2F2" : undefined }}>
                <td>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 24, height: 24, borderRadius: "50%",
                    background: i === 0 ? "#CC0000" : "#F3F4F6",
                    color: i === 0 ? "#fff" : "#6B7280",
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                </td>
                <td style={{ fontWeight: i === 0 ? 600 : 400, color: "#1A1A1A" }}>{d.name}</td>
                <td>Team {d.team}</td>
                <td style={{ textAlign: "right", fontWeight: 500 }}>{d.recentOtHours}h</td>
                <td style={{ textAlign: "right" }}>{d.seniorityYears}y</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* History */}
      {resolved.length > 0 && (
        <>
          <h2 className="text-section mb-3">History</h2>
          <Card style={{ padding: 0, overflowX: "auto" }}>
            <table className="ffims-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map((ot) => (
                  <tr key={ot.id}>
                    <td style={{ fontWeight: 500, color: "#1A1A1A" }}>{ot.driverName}</td>
                    <td>{ot.date}</td>
                    <td>{ot.hours}h</td>
                    <td>{ot.reason}</td>
                    <td><OTChip status={ot.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

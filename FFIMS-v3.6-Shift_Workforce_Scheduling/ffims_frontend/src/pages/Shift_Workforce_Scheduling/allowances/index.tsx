
import { useFFIMSStore } from "@/store/ffims-store";
import { PageHeading, Card, KPICard } from "@/components/ui/ffims-ui";
import { ALLOWANCE_PACKAGES } from "@/lib/ffims-data";
import { DigitalTicket } from "@/types/ffims-types";
import { DollarSign, CheckCircle, Clock, Tag } from "lucide-react";

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  local:           { bg: "#DCFCE7", color: "#166534" },
  "long-distance": { bg: "#DBEAFE", color: "#1E40AF" },
  "cross-border":  { bg: "#FEE2E2", color: "#991B1B" },
  "early-start":   { bg: "#FEF9C3", color: "#854D0E" },
  overnight:       { bg: "#F3E8FF", color: "#6B21A8" },
};

function TicketCard({ ticket, onRedeem }: { ticket: DigitalTicket; onRedeem: () => void }) {
  const pkg = ALLOWANCE_PACKAGES.find((p) => p.id === ticket.allowancePackageId);
  const isRedeemed = ticket.status === "redeemed";

  return (
    <div style={{
      background: isRedeemed ? "#F9FAFB" : "#fff",
      border: `1px solid ${isRedeemed ? "#E5E7EB" : "#CC0000"}`,
      borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10,
      opacity: isRedeemed ? 0.7 : 1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <Tag style={{ width: 14, height: 14, color: "#CC0000" }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#CC0000", letterSpacing: 1, fontFamily: "monospace" }}>
              {ticket.couponCode}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{ticket.driverName}</p>
          <p style={{ fontSize: 11, color: "#9CA3AF" }}>{pkg?.name}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: isRedeemed ? "#6B7280" : "#1A1A1A" }}>${ticket.rateUsd}</p>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
            textTransform: "uppercase", letterSpacing: "0.05em",
            background: isRedeemed ? "#F3F4F6" : "#DCFCE7",
            color: isRedeemed ? "#6B7280" : "#166534",
          }}>
            {ticket.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ fontSize: 11, color: "#6B7280", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span>Journey: {ticket.journeyId}</span>
        <span>Issued: {new Date(ticket.issuedAt).toLocaleDateString("en-ZW")}</span>
        {ticket.redeemedAt && <span>Redeemed: {new Date(ticket.redeemedAt).toLocaleDateString("en-ZW")}</span>}
        {ticket.auditRef && <span style={{ fontFamily: "monospace", background: "#F3F4F6", padding: "1px 5px", borderRadius: 3 }}>{ticket.auditRef}</span>}
      </div>

      {/* Redeem button */}
      {!isRedeemed && (
        <button onClick={onRedeem} className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>
          <CheckCircle style={{ width: 13, height: 13 }} /> Redeem Coupon
        </button>
      )}
    </div>
  );
}

export default function AllowancesPage() {
  const { tickets, redeemTicket } = useFFIMSStore();

  const issued   = tickets.filter((t) => t.status === "issued");
  const redeemed = tickets.filter((t) => t.status === "redeemed");
  const totalIssued   = tickets.reduce((a, t) => a + t.rateUsd, 0);
  const totalRedeemed = redeemed.reduce((a, t) => a + t.rateUsd, 0);

  return (
    <div>
      <PageHeading title="Allowances & Tickets" subtitle="Standardized allowance packages · Digital coupon redemption · Audit trail" />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
        <KPICard label="Issued tickets"   value={issued.length}        variant="info" />
        <KPICard label="Redeemed"         value={redeemed.length}      variant="success" />
        <KPICard label="Total issued"     value={`$${totalIssued}`}    variant="default" />
        <KPICard label="Total redeemed"   value={`$${totalRedeemed}`}  variant="success" />
      </div>

      {/* Allowance packages lookup table */}
      <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A", marginBottom: 10 }}>Allowance packages</h2>
      <Card style={{ padding: 0, overflowX: "auto", marginBottom: 28 }}>
        <table className="ffims-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Package name</th>
              <th>Type</th>
              <th>Distance range</th>
              <th style={{ textAlign: "right" }}>Rate (USD)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {ALLOWANCE_PACKAGES.map((pkg) => {
              const tc = TYPE_COLOR[pkg.type] ?? { bg: "#F3F4F6", color: "#374151" };
              return (
                <tr key={pkg.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#CC0000" }}>{pkg.couponCode}</td>
                  <td style={{ fontWeight: 500, color: "#1A1A1A" }}>{pkg.name}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: tc.bg, color: tc.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {pkg.type}
                    </span>
                  </td>
                  <td style={{ color: "#6B7280" }}>
                    {pkg.maxDistanceKm === 9999 ? `${pkg.minDistanceKm}km+` : `${pkg.minDistanceKm}–${pkg.maxDistanceKm}km`}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "#1A1A1A" }}>${pkg.rateUsd}</td>
                  <td style={{ color: "#6B7280" }}>{pkg.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Active tickets */}
      {issued.length > 0 && (
        <>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A", marginBottom: 10 }}>
            Pending redemption ({issued.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 28 }}>
            {issued.map((t) => <TicketCard key={t.id} ticket={t} onRedeem={() => redeemTicket(t.id)} />)}
          </div>
        </>
      )}

      {/* Redeemed tickets — audit trail */}
      {redeemed.length > 0 && (
        <>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A", marginBottom: 10 }}>Redeemed — audit trail</h2>
          <Card style={{ padding: 0, overflowX: "auto" }}>
            <table className="ffims-table">
              <thead>
                <tr>
                  <th>Coupon</th>
                  <th>Driver</th>
                  <th>Package</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Redeemed</th>
                  <th>Audit ref</th>
                </tr>
              </thead>
              <tbody>
                {redeemed.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#CC0000" }}>{t.couponCode}</td>
                    <td style={{ fontWeight: 500, color: "#1A1A1A" }}>{t.driverName}</td>
                    <td>{ALLOWANCE_PACKAGES.find((p) => p.id === t.allowancePackageId)?.name ?? "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>${t.rateUsd}</td>
                    <td>{t.redeemedAt ? new Date(t.redeemedAt).toLocaleDateString("en-ZW") : "—"}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11, color: "#6B7280" }}>{t.auditRef ?? "—"}</td>
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

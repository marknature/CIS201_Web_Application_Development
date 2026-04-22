
import { useState } from "react";
import { useFFIMSStore } from "@/store/ffims-store";
import { PageHeading, Card, KPICard } from "@/components/ui/ffims-ui";
import { ALLOWANCE_PACKAGES } from "@/lib/ffims-data";
import { Journey, JourneyStatus } from "@/types/ffims-types";
import { MapPin, Clock, CheckCircle, AlertTriangle, Navigation, DollarSign } from "lucide-react";

const STATUS_STYLE: Record<JourneyStatus, { bg: string; color: string; label: string }> = {
  scheduled:   { bg: "#DBEAFE", color: "#1E40AF", label: "Scheduled" },
  "in-progress": { bg: "#DCFCE7", color: "#166534", label: "In Progress" },
  completed:   { bg: "#F3F4F6", color: "#374151", label: "Completed" },
  delayed:     { bg: "#FEE2E2", color: "#991B1B", label: "Delayed" },
};

const TYPE_LABEL: Record<string, string> = {
  local: "Local", "long-distance": "Long-Distance", "cross-border": "Cross-Border",
};

function JourneyCard({ journey, onComplete, onDelay }: {
  journey: Journey;
  onComplete: () => void;
  onDelay: () => void;
}) {
  const pkg = ALLOWANCE_PACKAGES.find((p) => p.id === journey.allowancePackageId);
  const s = STATUS_STYLE[journey.status];

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{journey.driverName}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {s.label}
            </span>
            {journey.delayMinutes && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#FEE2E2", color: "#991B1B" }}>
                +{journey.delayMinutes}min delay
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
            <MapPin style={{ width: 12, height: 12 }} />
            {journey.destination}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#9CA3AF" }}>{journey.date} · Start {journey.shiftStart}</p>
          <p style={{ fontSize: 12, color: "#374151", marginTop: 2 }}>
            {journey.distanceKm} km · ~{Math.floor(journey.estimatedDurationMin / 60)}h {journey.estimatedDurationMin % 60}m
          </p>
        </div>
      </div>

      {/* Journey type + allowance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "10px 0", borderTop: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6" }}>
        <div>
          <p style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Journey type</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{TYPE_LABEL[journey.journeyType]}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Allowance</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#CC0000" }}>${pkg?.rateUsd ?? "—"} · {pkg?.couponCode}</p>
        </div>
        {journey.etaTimestamp && (
          <div>
            <p style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>ETA</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>
              {new Date(journey.etaTimestamp).toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>

      {journey.notes && (
        <p style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>{journey.notes}</p>
      )}

      {/* Actions */}
      {(journey.status === "in-progress" || journey.status === "delayed") && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onComplete} className="btn btn-success btn-sm">
            <CheckCircle style={{ width: 13, height: 13 }} /> Mark Complete
          </button>
          {journey.status !== "delayed" && (
            <button onClick={onDelay} className="btn btn-sm" style={{ background: "#FEF9C3", color: "#854D0E", border: "none" }}>
              <AlertTriangle style={{ width: 13, height: 13 }} /> Report Delay
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

export default function JourneysPage() {
  const { journeys, completeJourney, updateJourneyStatus } = useFFIMSStore();
  const [filter, setFilter] = useState<JourneyStatus | "all">("all");

  const active    = journeys.filter((j) => j.status === "in-progress" || j.status === "delayed").length;
  const scheduled = journeys.filter((j) => j.status === "scheduled").length;
  const delayed   = journeys.filter((j) => j.status === "delayed").length;
  const totalKm   = journeys.filter((j) => j.status === "completed").reduce((a, j) => a + j.distanceKm, 0);

  const filtered = filter === "all" ? journeys : journeys.filter((j) => j.status === filter);

  const filters: { label: string; value: JourneyStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Scheduled", value: "scheduled" },
    { label: "In Progress", value: "in-progress" },
    { label: "Delayed", value: "delayed" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div>
      <PageHeading title="Journeys" subtitle="Journey tracking, allowance packages, and ETA management" />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        <KPICard label="Active journeys"  value={active}    variant={active > 0 ? "success" : "default"} />
        <KPICard label="Scheduled today"  value={scheduled} variant="info" />
        <KPICard label="Delayed"          value={delayed}   variant={delayed > 0 ? "danger" : "default"} />
        <KPICard label="Km completed"     value={`${totalKm}km`} variant="default" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: filter === value ? "#CC0000" : "#fff",
              color: filter === value ? "#fff" : "#6B7280",
              border: filter === value ? "1px solid #CC0000" : "1px solid #E5E7EB",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Journey cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>No journeys for this filter.</p>
        ) : filtered.map((j) => (
          <JourneyCard
            key={j.id}
            journey={j}
            onComplete={() => completeJourney(j.id)}
            onDelay={() => updateJourneyStatus(j.id, "delayed", 30)}
          />
        ))}
      </div>
    </div>
  );
}

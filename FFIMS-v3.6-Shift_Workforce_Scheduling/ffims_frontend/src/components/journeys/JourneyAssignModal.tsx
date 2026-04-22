
import { useState } from "react";
import { Driver, Journey, AllowancePackage } from "@/types/ffims-types";
import { getAllowanceForDistance } from "@/lib/ffims-data";
import { X, MapPin, Clock, DollarSign, AlertTriangle } from "lucide-react";

interface JourneyAssignModalProps {
  driver: Driver;
  date: string;
  allowancePackages: AllowancePackage[];
  onConfirm: (journey: Omit<Journey, "id">) => void;
  onCancel: () => void;
}

export function JourneyAssignModal({ driver, date, allowancePackages, onConfirm, onCancel }: JourneyAssignModalProps) {
  const [destination, setDestination] = useState("");
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [shiftStart, setShiftStart] = useState("04:30");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const suggestedPackage = distanceKm > 0 ? getAllowanceForDistance(distanceKm) : null;
  const isEarlyStart = shiftStart <= "05:30";
  const earlyPkg = allowancePackages.find((p) => p.type === "early-start");
  const totalAllowance = (suggestedPackage?.rateUsd ?? 0) + (isEarlyStart ? (earlyPkg?.rateUsd ?? 0) : 0);

  // Journey fatigue warning: >200km or >3h estimated
  const estimatedMin = Math.round((distanceKm / 80) * 60); // avg 80km/h
  const fatigueWarn = distanceKm > 200 || estimatedMin > 180;
  const hoursWarn = driver.weeklyHours >= 42;

  function handleConfirm() {
    if (!destination.trim()) { setError("Destination is required."); return; }
    if (distanceKm <= 0) { setError("Distance must be greater than 0 km."); return; }
    setError("");

    const jType = distanceKm >= 400 ? "cross-border" : distanceKm >= 80 ? "long-distance" : "local";
    onConfirm({
      driverId: driver.id,
      driverName: driver.name,
      date,
      shiftStart,
      destination,
      destinationLat: -18.97 + Math.random() * 2 - 1, // placeholder until real geocoding
      destinationLng: 32.67 + Math.random() * 2 - 1,
      originLat: -18.9707,
      originLng: 32.6709,
      distanceKm,
      journeyType: jType,
      status: "scheduled",
      allowancePackageId: suggestedPackage?.id ?? "ap-local",
      estimatedDurationMin: estimatedMin,
      notes,
    });
  }

  return (
    /* Backdrop */
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A" }}>Assign Journey</p>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>{driver.name} · {date}</p>
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Warnings */}
          {fatigueWarn && (
            <div style={{ display: "flex", gap: 8, background: "#FEF9C3", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#854D0E" }}>
              <AlertTriangle style={{ width: 14, height: 14, marginTop: 1, flexShrink: 0 }} />
              Journey exceeds 200km or 3h — compliance engine will flag fatigue risk per Zimbabwe Labor Act.
            </div>
          )}
          {hoursWarn && (
            <div style={{ display: "flex", gap: 8, background: "#FEE2E2", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#991B1B" }}>
              <AlertTriangle style={{ width: 14, height: 14, marginTop: 1, flexShrink: 0 }} />
              {driver.name} is at {driver.weeklyHours}h this week — near the 45h Labor Act threshold.
            </div>
          )}

          {/* Shift start time */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
              <Clock style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />
              Shift start time
            </label>
            <input type="time" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="ffims-input" />
            {isEarlyStart && (
              <p style={{ fontSize: 11, color: "#854D0E", marginTop: 4 }}>⚡ Early start supplement (ES-A +${earlyPkg?.rateUsd}) will be added automatically.</p>
            )}
          </div>

          {/* Destination */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
              <MapPin style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />
              Destination
            </label>
            <input
              type="text" value={destination} onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Harare CBD — VIP Transfer"
              className="ffims-input"
            />
          </div>

          {/* Distance */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
              Estimated distance (km)
            </label>
            <input
              type="number" value={distanceKm || ""} onChange={(e) => setDistanceKm(Number(e.target.value))}
              placeholder="0" min={0} className="ffims-input"
            />
            {distanceKm > 0 && (
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                Est. duration: ~{Math.floor(estimatedMin / 60)}h {estimatedMin % 60}m &nbsp;·&nbsp;
                Journey type: <strong>{distanceKm >= 400 ? "Cross-border" : distanceKm >= 80 ? "Long-distance" : "Local"}</strong>
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Passenger details, special instructions…"
              style={{ width: "100%", height: 64, resize: "none", border: "1px solid #E5E7EB", borderRadius: 6, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>

          {/* Allowance summary */}
          {suggestedPackage && (
            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px", border: "1px solid #E5E7EB" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <DollarSign style={{ width: 13, height: 13, color: "#CC0000" }} />
                Allowance summary
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#6B7280" }}>{suggestedPackage.name} ({suggestedPackage.couponCode})</span>
                  <span style={{ fontWeight: 600 }}>${suggestedPackage.rateUsd}</span>
                </div>
                {isEarlyStart && earlyPkg && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#6B7280" }}>{earlyPkg.name} ({earlyPkg.couponCode})</span>
                    <span style={{ fontWeight: 600 }}>${earlyPkg.rateUsd}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, borderTop: "1px solid #E5E7EB", paddingTop: 6, marginTop: 4 }}>
                  <span>Total allowance</span>
                  <span style={{ color: "#CC0000" }}>${totalAllowance}</span>
                </div>
              </div>
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: "#991B1B" }}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "14px 20px", borderTop: "1px solid #E5E7EB" }}>
          <button onClick={onCancel} className="btn btn-secondary btn-sm">Cancel</button>
          <button onClick={handleConfirm} className="btn btn-primary btn-sm">Confirm Journey</button>
        </div>
      </div>
    </div>
  );
}

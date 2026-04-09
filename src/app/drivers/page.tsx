"use client";
import { useFFIMSStore } from "@/store/ffims";
import { PageHeading, ShiftChip, TeamBadge, Avatar, Card } from "@/components/ui";
import { getWeeklyHours } from "@/lib/compliance";
import { Phone } from "lucide-react";

const SKILL_STYLES: Record<string, { bg: string; color: string }> = {
  "bus":        { bg: "#DBEAFE", color: "#1E40AF" },
  "van":        { bg: "#DCFCE7", color: "#166534" },
  "hgv":        { bg: "#FEF9C3", color: "#854D0E" },
  "long-route": { bg: "#DBEAFE", color: "#1E40AF" },
  "night-duty": { bg: "#F3F4F6", color: "#374151" },
  "light-duty": { bg: "#DCFCE7", color: "#166534" },
  "events":     { bg: "#FEE2E2", color: "#991B1B" },
  "specialist": { bg: "#FEF9C3", color: "#854D0E" },
  "garden":     { bg: "#DCFCE7", color: "#166534" },
  "brush-cut":  { bg: "#FEE2E2", color: "#991B1B" },
};

export default function DriversPage() {
  const { drivers, roster } = useFFIMSStore();
  const todayIdx = 3;

  return (
    <div>
      <PageHeading title="Drivers" subtitle="Skill profiles, license classes, and real-time availability" />

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {(["A", "B"] as const).map((team) => {
          const count = drivers.filter((d) => d.team === team).length;
          return (
            <div key={team} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", border: "1px solid #E5E7EB",
              borderRadius: 8, padding: "8px 14px",
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: team === "A" ? "#CC0000" : "#3B82F6",
              }} />
              <span style={{ fontSize: 13, color: "#374151" }}>
                Team {team} &mdash; <strong>{count} drivers</strong> &nbsp;
                {team === "A" ? "(active week)" : "(rest week)"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Driver cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {drivers.map((driver) => {
          const todayShift = roster.roster[driver.id]?.[todayIdx];
          const hrs = getWeeklyHours(roster.roster[driver.id] ?? []);
          const hrsColor = hrs >= 45 ? "#991B1B" : hrs >= 42 ? "#854D0E" : "#166534";
          const hrsBg   = hrs >= 45 ? "#FEE2E2" : hrs >= 42 ? "#FEF9C3" : "#DCFCE7";

          return (
            <Card key={driver.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={driver.name} size={38} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{driver.name}</span>
                      <TeamBadge team={driver.team} />
                    </div>
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{driver.licenseClass}</p>
                  </div>
                </div>
                {todayShift && <ShiftChip type={todayShift.type} />}
              </div>

              {/* Skill tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {driver.skillTags.map((tag) => {
                  const s = SKILL_STYLES[tag] ?? { bg: "#F3F4F6", color: "#374151" };
                  return (
                    <span key={tag} style={{
                      fontSize: 11, fontWeight: 500, padding: "2px 8px",
                      borderRadius: 4, background: s.bg, color: s.color,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {tag}
                    </span>
                  );
                })}
              </div>

              {/* Stats bar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
                {[
                  { label: "Week hrs", value: `${hrs}h`, color: hrsColor, bg: hrsBg },
                  { label: "Seniority", value: `${driver.seniorityYears}y`, color: "#1A1A1A", bg: undefined },
                  { label: "Recent OT", value: `${driver.recentOtHours}h`, color: driver.recentOtHours > 4 ? "#854D0E" : "#1A1A1A", bg: undefined },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{label}</p>
                    <span style={{
                      fontSize: 15, fontWeight: 700, color,
                      background: bg, borderRadius: 4,
                      padding: bg ? "1px 6px" : undefined,
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9CA3AF", borderTop: "1px solid #F3F4F6", paddingTop: 10 }}>
                <Phone style={{ width: 12, height: 12 }} />
                {driver.phone}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

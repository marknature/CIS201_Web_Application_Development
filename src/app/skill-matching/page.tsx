"use client";
import { useState } from "react";
import { useFFIMSStore } from "@/store/ffims";
import { PageHeading, Avatar, Card } from "@/components/ui";
import { matchDriversToTask, ALL_SKILLS } from "@/lib/skillMatch";
import { Cpu, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const SKILL_STYLES: Record<string, { bg: string; color: string; activeBg: string; activeColor: string; border: string }> = {
  "bus":        { bg: "#F9FAFB", color: "#6B7280", activeBg: "#DBEAFE", activeColor: "#1E40AF", border: "#93C5FD" },
  "van":        { bg: "#F9FAFB", color: "#6B7280", activeBg: "#DCFCE7", activeColor: "#166534", border: "#86EFAC" },
  "hgv":        { bg: "#F9FAFB", color: "#6B7280", activeBg: "#FEF9C3", activeColor: "#854D0E", border: "#FDE68A" },
  "long-route": { bg: "#F9FAFB", color: "#6B7280", activeBg: "#DBEAFE", activeColor: "#1E40AF", border: "#93C5FD" },
  "night-duty": { bg: "#F9FAFB", color: "#6B7280", activeBg: "#F3F4F6", activeColor: "#374151", border: "#D1D5DB" },
  "light-duty": { bg: "#F9FAFB", color: "#6B7280", activeBg: "#DCFCE7", activeColor: "#166534", border: "#86EFAC" },
  "events":     { bg: "#F9FAFB", color: "#6B7280", activeBg: "#FEE2E2", activeColor: "#991B1B", border: "#FCA5A5" },
  "specialist": { bg: "#F9FAFB", color: "#6B7280", activeBg: "#FEF9C3", activeColor: "#854D0E", border: "#FDE68A" },
  "garden":     { bg: "#F9FAFB", color: "#6B7280", activeBg: "#DCFCE7", activeColor: "#166534", border: "#86EFAC" },
  "brush-cut":  { bg: "#F9FAFB", color: "#6B7280", activeBg: "#FEE2E2", activeColor: "#991B1B", border: "#FCA5A5" },
};

const DEFAULT_STYLE = { bg: "#F9FAFB", color: "#6B7280", activeBg: "#F3F4F6", activeColor: "#374151", border: "#D1D5DB" };

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "#22C55E" : pct >= 50 ? "#FACC15" : "#EF4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

export default function SkillMatchingPage() {
  const { drivers } = useFFIMSStore();
  const [selected, setSelected] = useState<string[]>([]);
  const results = selected.length > 0 ? matchDriversToTask(selected, drivers) : [];

  function toggle(skill: string) {
    setSelected((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  }

  return (
    <div>
      <PageHeading title="Skill Matching" subtitle="AI-powered cosine similarity — select task requirements to rank drivers" />

      {/* Skill selector panel */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu style={{ width: 14, height: 14, color: "#fff" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>Task skill requirements</p>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>Select the skills required for this zone or task</p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL_SKILLS.map((skill) => {
            const active = selected.includes(skill);
            const s = SKILL_STYLES[skill] ?? DEFAULT_STYLE;
            return (
              <button
                key={skill}
                onClick={() => toggle(skill)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.15s",
                  background: active ? s.activeBg : s.bg,
                  color: active ? s.activeColor : s.color,
                  border: active ? `1.5px solid ${s.border}` : "1.5px solid #E5E7EB",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}
              >
                {active && <CheckCircle style={{ width: 11, height: 11 }} />}
                {skill}
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
            <p style={{ fontSize: 12, color: "#6B7280" }}>
              <strong style={{ color: "#1A1A1A" }}>{selected.length}</strong> skill{selected.length !== 1 ? "s" : ""} selected
            </p>
            <button
              onClick={() => setSelected([])}
              style={{ fontSize: 12, color: "#CC0000", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
            >
              Clear all
            </button>
          </div>
        )}

        {selected.length === 0 && (
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>
            Select one or more skills above to rank all drivers by match score.
          </p>
        )}
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 className="text-section">Match results</h2>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>Ranked by cosine similarity score</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r, i) => {
              const driver = drivers.find((d) => d.id === r.driverId);
              const pct = Math.round(r.score * 100);
              const isBest = i === 0;

              return (
                <Card
                  key={r.driverId}
                  style={{
                    border: isBest ? "2px solid #CC0000" : "1px solid #E5E7EB",
                    position: "relative",
                  }}
                >
                  {/* Rank badge */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: isBest ? "#CC0000" : "#F3F4F6",
                      color: isBest ? "#fff" : "#6B7280",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {i + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Driver info */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <Avatar name={r.driverName} size={32} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{r.driverName}</span>
                            {isBest && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "2px 7px",
                                borderRadius: 4, background: "#CC0000", color: "#fff",
                                textTransform: "uppercase", letterSpacing: "0.05em",
                              }}>
                                Best match
                              </span>
                            )}
                          </div>
                          {driver && (
                            <p style={{ fontSize: 11, color: "#9CA3AF" }}>
                              Team {driver.team} · {driver.licenseClass} · {driver.seniorityYears}y seniority
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Score bar */}
                      <div style={{ marginBottom: 10 }}>
                        <ScoreBar score={r.score} />
                      </div>

                      {/* Matched / missing skills */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                        {r.matchedSkills.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <CheckCircle style={{ width: 13, height: 13, color: "#22C55E", flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: "#6B7280" }}>Has:</span>
                            {r.matchedSkills.map((s) => (
                              <span key={s} style={{ fontSize: 11, fontWeight: 500, padding: "1px 7px", borderRadius: 4, background: "#DCFCE7", color: "#166534", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s}</span>
                            ))}
                          </div>
                        )}
                        {r.missingSkills.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <XCircle style={{ width: 13, height: 13, color: "#EF4444", flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: "#6B7280" }}>Missing:</span>
                            {r.missingSkills.map((s) => (
                              <span key={s} style={{ fontSize: 11, fontWeight: 500, padding: "1px 7px", borderRadius: 4, background: "#FEE2E2", color: "#991B1B", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {selected.length > 0 && results.length === 0 && (
        <p style={{ fontSize: 13, color: "#9CA3AF" }}>No drivers found. Try selecting different skills.</p>
      )}
    </div>
  );
}

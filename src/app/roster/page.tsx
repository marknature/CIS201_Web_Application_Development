"use client";
import { useState, useCallback } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable,
} from "@dnd-kit/core";
import { useFFIMSStore } from "@/store/ffims";
import { ShiftChip, PageHeading, KPICard, ComplianceRow, Card } from "@/components/ui";
import { ShiftType, DayShift } from "@/types";
import { DRIVERS } from "@/lib/data";
import { clsx } from "clsx";
import { CheckCircle } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFT_CYCLE: ShiftType[] = ["duty", "standby", "leave", "rest", "ot"];
const WEEKS = ["Apr 7–13, 2026", "Apr 14–20, 2026", "Apr 21–27, 2026"];

function DroppableCell({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <td ref={setNodeRef} style={{ padding: "4px 6px", textAlign: "center", verticalAlign: "middle", background: isOver ? "#FEF2F2" : undefined, outline: isOver ? "2px dashed #CC0000" : undefined, outlineOffset: -2, transition: "background 0.1s" }}>
      {children}
    </td>
  );
}

function DraggablePill({ id, shift, onCycle }: { id: string; shift: DayShift; onCycle: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onCycle}
      title="Click to cycle · Drag to swap"
      style={{ opacity: isDragging ? 0.4 : 1, display: "inline-flex" }}
    >
      {shift.conflictFlag
        ? <span className="chip chip-conflict">⚠ Conflict</span>
        : <ShiftChip type={shift.type} />
      }
    </span>
  );
}

export default function RosterPage() {
  const { roster, violations, compliancePct, updateShift, swapShifts } = useFFIMSStore();
  const [weekIdx, setWeekIdx] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "warn" | "err" } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const showToast = useCallback((msg: string, type: "ok" | "warn" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const parse = (id: string) => { const [d, i] = id.split("-").map(Number); return { driverId: d, dayIdx: i }; };

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { over, active } = e;
    if (!over || over.id === active.id) return;
    const src = parse(active.id as string);
    const dst = parse(over.id as string);
    const srcShift = roster.roster[src.driverId]?.[src.dayIdx];
    const dstShift = roster.roster[dst.driverId]?.[dst.dayIdx];
    if (dstShift?.type === "leave" && srcShift?.type === "duty") {
      showToast("Blocked: Cannot assign duty over approved leave.", "err"); return;
    }
    swapShifts(src.driverId, src.dayIdx, dst.driverId, dst.dayIdx);
    showToast("Shift swapped.");
  }

  const todayIdx = 3;
  const onDuty = DRIVERS.filter((d) => roster.roster[d.id]?.[todayIdx]?.type === "duty").length;
  const onLeave = DRIVERS.filter((d) => roster.roster[d.id]?.some((s) => s.type === "leave")).length;
  const otHrs = DRIVERS.reduce((a, d) => a + (roster.roster[d.id] ?? []).filter((s) => s.type === "ot").length * 4, 0);
  const errors = violations.filter((v) => v.severity === "error");
  const warnings = violations.filter((v) => v.severity === "warning");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <PageHeading title="Roster Board" subtitle="Drag to swap shifts · Click any chip to cycle status" />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))}>←</button>
          <span style={{ fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>Week {weekIdx + 1} — {WEEKS[weekIdx]}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekIdx(Math.min(2, weekIdx + 1))}>→</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        <KPICard label="On duty today"   value={onDuty}              variant="success" />
        <KPICard label="On leave"        value={onLeave}             variant="warning" />
        <KPICard label="OT hours (week)" value={`${otHrs}h`}         variant="warning" />
        <KPICard label="Compliance"      value={`${compliancePct}%`} variant={compliancePct >= 95 ? "success" : "danger"} />
      </div>

      {/* Roster table */}
      <Card style={{ padding: 0, overflowX: "auto", marginBottom: 16 }}>
        <DndContext sensors={sensors} onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)} onDragEnd={onDragEnd}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680, fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#6B7280", minWidth: 140 }}>Driver</th>
                {DAYS.map((d) => (
                  <th key={d} style={{ padding: "10px 6px", textAlign: "center", fontWeight: 500, fontSize: 12, color: "#6B7280" }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["A", "B"] as const).map((team) => (
                <>
                  <tr key={`hdr-${team}`} style={{ background: team === "A" ? "#FEF2F2" : "#EFF6FF" }}>
                    <td colSpan={8} style={{ padding: "6px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: team === "A" ? "#991B1B" : "#1E40AF" }}>
                      Team {team} — {team === "A" ? "Active week" : "Rest week"}
                    </td>
                  </tr>
                  {DRIVERS.filter((d) => d.team === team).map((driver) => (
                    <tr key={driver.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "8px 16px" }}>
                        <p style={{ fontWeight: 600, color: "#1A1A1A", fontSize: 13 }}>{driver.name}</p>
                        <p style={{ fontSize: 11, color: "#9CA3AF" }}>{driver.licenseClass}</p>
                      </td>
                      {DAYS.map((_, di) => {
                        const shift = roster.roster[driver.id]?.[di];
                        if (!shift) return <td key={di} />;
                        const cellId = `${driver.id}-${di}`;
                        return (
                          <DroppableCell key={cellId} id={cellId}>
                            <DraggablePill id={cellId} shift={shift} onCycle={() => {
                              const cur = shift.type;
                              const next = SHIFT_CYCLE[(SHIFT_CYCLE.indexOf(cur) + 1) % SHIFT_CYCLE.length];
                              updateShift(driver.id, di, next);
                            }} />
                          </DroppableCell>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
          <DragOverlay>
            {activeId && (() => {
              const { driverId, dayIdx } = parse(activeId);
              const shift = roster.roster[driverId]?.[dayIdx];
              return shift ? <span style={{ background: "#fff", borderRadius: 6, padding: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}><ShiftChip type={shift.type} /></span> : null;
            })()}
          </DragOverlay>
        </DndContext>
      </Card>

      {/* Compliance */}
      {violations.length > 0 ? (
        <Card>
          <h2 className="text-section mb-3">Compliance engine</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {errors.map((v, i) => <ComplianceRow key={i} severity="error" message={v.message} />)}
            {warnings.map((v, i) => <ComplianceRow key={i} severity="warning" message={v.message} />)}
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#166534" }}>
            <CheckCircle style={{ width: 16, height: 16 }} />
            All shifts comply with Zimbabwe Labor Act regulations.
          </div>
        </Card>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 50,
          padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          background: toast.type === "err" ? "#FEE2E2" : toast.type === "warn" ? "#FEF9C3" : "#fff",
          color: toast.type === "err" ? "#991B1B" : toast.type === "warn" ? "#854D0E" : "#1A1A1A",
          border: `1px solid ${toast.type === "err" ? "#FCA5A5" : toast.type === "warn" ? "#FDE68A" : "#E5E7EB"}`,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

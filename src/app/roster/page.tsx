"use client";
import { useState, useCallback } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable,
} from "@dnd-kit/core";
import { useFFIMSStore } from "@/store/ffims";
import { ShiftBadge, SectionHeading, KPICard } from "@/components/ui";
import { ShiftType, DayShift } from "@/types";
import { DRIVERS } from "@/lib/data";
import { AlertTriangle, XCircle } from "lucide-react";
import { clsx } from "clsx";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFT_CYCLE: ShiftType[] = ["duty", "standby", "leave", "rest", "ot"];
const WEEKS = ["Week 1 — Apr 7–13, 2026", "Week 2 — Apr 14–20, 2026", "Week 3 — Apr 21–27, 2026"];

// Droppable cell
function DroppableCell({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <td
      ref={setNodeRef}
      className={clsx(
        "px-1 py-1.5 text-center align-middle transition-colors",
        isOver && "bg-[#E1F5EE] rounded"
      )}
    >
      {children}
    </td>
  );
}

// Draggable shift pill
function DraggablePill({
  id, shift, driverId, dayIdx, onCycle,
}: {
  id: string; shift: DayShift; driverId: number; dayIdx: number; onCycle: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onCycle}
      className={clsx(
        "inline-flex cursor-grab select-none items-center justify-center rounded px-2 py-1 text-xs font-medium active:cursor-grabbing",
        isDragging && "opacity-40",
        shift.conflictFlag && "conflict-pill border border-[#E24B4A] bg-[#FCEBEB] text-[#791F1F] animate-pulse"
      )}
      style={{ minWidth: 68 }}
      title="Click to cycle shift type, or drag to swap"
    >
      {!shift.conflictFlag && <ShiftBadge type={shift.type} />}
      {shift.conflictFlag && "⚠ Conflict"}
    </span>
  );
}

export default function RosterPage() {
  const { roster, violations, compliancePct, updateShift, swapShifts } = useFFIMSStore();
  const [weekIdx, setWeekIdx] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "warn" | "err" | "ok" } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const showToast = useCallback((msg: string, type: "warn" | "err" | "ok" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  function parseId(id: string) {
    const [driverId, dayIdx] = id.split("-").map(Number);
    return { driverId, dayIdx };
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { over, active } = e;
    if (!over || over.id === active.id) return;
    const src = parseId(active.id as string);
    const dst = parseId(over.id as string);

    // Check leave conflict
    const dstShift = roster.roster[dst.driverId]?.[dst.dayIdx];
    const srcShift = roster.roster[src.driverId]?.[src.dayIdx];
    if (dstShift?.type === "leave" && srcShift?.type === "duty") {
      showToast(`Blocked: Cannot assign duty to a driver on approved leave.`, "err");
      return;
    }
    swapShifts(src.driverId, src.dayIdx, dst.driverId, dst.dayIdx);
    showToast("Shift swapped successfully.", "ok");
  }

  function handleCycle(driverId: number, dayIdx: number) {
    const cur = roster.roster[driverId]?.[dayIdx]?.type ?? "rest";
    const next = SHIFT_CYCLE[(SHIFT_CYCLE.indexOf(cur) + 1) % SHIFT_CYCLE.length];
    updateShift(driverId, dayIdx, next);
  }

  const errors = violations.filter((v) => v.severity === "error");
  const warnings = violations.filter((v) => v.severity === "warning");

  // today KPIs
  const todayIdx = 3;
  const onDuty = DRIVERS.filter((d) => roster.roster[d.id]?.[todayIdx]?.type === "duty").length;
  const onLeave = DRIVERS.filter((d) => roster.roster[d.id]?.some((s) => s.type === "leave")).length;
  const otHours = DRIVERS.reduce((acc, d) => acc + (roster.roster[d.id] ?? []).filter((s) => s.type === "ot").length * 4, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <SectionHeading title="Roster Board" subtitle="Drag to swap · Click pill to cycle shift type" />
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))} className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">←</button>
          <span className="text-xs text-gray-500 whitespace-nowrap">{WEEKS[weekIdx]}</span>
          <button onClick={() => setWeekIdx(Math.min(WEEKS.length - 1, weekIdx + 1))} className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">→</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard label="On duty today"   value={onDuty}              accent="green" />
        <KPICard label="On leave"        value={onLeave}             accent="amber" />
        <KPICard label="OT hours (week)" value={`${otHours}h`}       accent="amber" />
        <KPICard label="Compliance"      value={`${compliancePct}%`} accent={compliancePct >= 95 ? "green" : "amber"} />
      </div>

      {/* Roster table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <table className="w-full min-w-[640px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="min-w-[120px] px-3 py-2.5 text-left text-xs font-medium text-gray-500">Driver</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-1 py-2.5 text-center text-xs font-medium text-gray-500">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {["A", "B"].map((team) => (
                <>
                  <tr key={`team-${team}`} className="bg-gray-50/60">
                    <td colSpan={8} className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Team {team} — {team === "A" ? "Active week" : "Rest week"}
                    </td>
                  </tr>
                  {DRIVERS.filter((d) => d.team === team).map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50/40">
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-[10px] text-gray-400">{driver.licenseClass}</p>
                      </td>
                      {DAYS.map((_, dayIdx) => {
                        const shift = roster.roster[driver.id]?.[dayIdx];
                        if (!shift) return <td key={dayIdx} />;
                        const cellId = `${driver.id}-${dayIdx}`;
                        return (
                          <DroppableCell key={cellId} id={cellId}>
                            <DraggablePill
                              id={cellId}
                              shift={shift}
                              driverId={driver.id}
                              dayIdx={dayIdx}
                              onCycle={() => handleCycle(driver.id, dayIdx)}
                            />
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
              const { driverId, dayIdx } = parseId(activeId);
              const shift = roster.roster[driverId]?.[dayIdx];
              return shift ? (
                <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium shadow-lg ring-1 ring-gray-200 bg-white">
                  <ShiftBadge type={shift.type} />
                </span>
              ) : null;
            })()}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Compliance */}
      {violations.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-gray-900">Compliance engine</h2>
          <div className="space-y-1.5">
            {errors.map((v, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-[#FCEBEB] px-3 py-2 text-xs text-[#791F1F]">
                <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {v.message}
              </div>
            ))}
            {warnings.map((v, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-[#FAEEDA] px-3 py-2 text-xs text-[#633806]">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {v.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={clsx(
          "fixed bottom-4 right-4 z-50 max-w-xs rounded-lg border px-4 py-2.5 text-xs shadow-lg transition-all",
          toast.type === "err"  && "border-[#E24B4A] bg-[#FCEBEB] text-[#791F1F]",
          toast.type === "warn" && "border-[#EF9F27] bg-[#FAEEDA] text-[#633806]",
          toast.type === "ok"   && "border-gray-200 bg-white text-gray-700"
        )}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

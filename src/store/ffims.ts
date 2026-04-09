"use client";
import { create } from "zustand";
import {
  Driver, WeekRoster, LeaveRequest, OvertimeRecord,
  DayShift, ShiftType, ComplianceViolation,
} from "@/types";
import { DRIVERS, INITIAL_ROSTER, LEAVE_REQUESTS, OVERTIME_RECORDS } from "@/lib/data";
import { runComplianceChecks, compliancePercent, fairnessIndex } from "@/lib/compliance";

interface FFIMSStore {
  // Data
  drivers: Driver[];
  roster: WeekRoster;
  leaveRequests: LeaveRequest[];
  overtimeRecords: OvertimeRecord[];
  violations: ComplianceViolation[];
  compliancePct: number;
  fairness: number;

  // Roster actions
  swapShifts: (aDriverId: number, aDayIdx: number, bDriverId: number, bDayIdx: number) => void;
  updateShift: (driverId: number, dayIdx: number, type: ShiftType) => void;

  // Leave actions
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;

  // OT actions
  approveOvertime: (id: string) => void;
  declineOvertime: (id: string) => void;
}

function recompute(
  roster: WeekRoster,
  drivers: Driver[]
): { violations: ComplianceViolation[]; compliancePct: number; fairness: number } {
  const violations = runComplianceChecks(roster.roster, drivers);
  return {
    violations,
    compliancePct: compliancePercent(violations),
    fairness: fairnessIndex(drivers),
  };
}

export const useFFIMSStore = create<FFIMSStore>((set, get) => ({
  drivers: DRIVERS,
  roster: INITIAL_ROSTER,
  leaveRequests: LEAVE_REQUESTS,
  overtimeRecords: OVERTIME_RECORDS,
  ...recompute(INITIAL_ROSTER, DRIVERS),

  swapShifts(aDriverId, aDayIdx, bDriverId, bDayIdx) {
    set((state) => {
      const newRoster = { ...state.roster, roster: { ...state.roster.roster } };
      const aShifts = [...newRoster.roster[aDriverId]];
      const bShifts = [...newRoster.roster[bDriverId]];
      const tmp = { ...aShifts[aDayIdx] };
      aShifts[aDayIdx] = { ...bShifts[bDayIdx] };
      bShifts[bDayIdx] = tmp;
      newRoster.roster[aDriverId] = aShifts;
      newRoster.roster[bDriverId] = bShifts;
      return { roster: newRoster, ...recompute(newRoster, state.drivers) };
    });
  },

  updateShift(driverId, dayIdx, type) {
    set((state) => {
      const newRoster = { ...state.roster, roster: { ...state.roster.roster } };
      const shifts = [...newRoster.roster[driverId]];
      shifts[dayIdx] = { ...shifts[dayIdx], type };
      newRoster.roster[driverId] = shifts;
      return { roster: newRoster, ...recompute(newRoster, state.drivers) };
    });
  },

  approveLeave(id) {
    set((state) => ({
      leaveRequests: state.leaveRequests.map((lr) =>
        lr.id === id ? { ...lr, status: "approved", reviewedBy: "Supervisor", reviewedAt: new Date().toISOString() } : lr
      ),
    }));
  },

  rejectLeave(id) {
    set((state) => ({
      leaveRequests: state.leaveRequests.map((lr) =>
        lr.id === id ? { ...lr, status: "rejected", reviewedBy: "Supervisor", reviewedAt: new Date().toISOString() } : lr
      ),
    }));
  },

  approveOvertime(id) {
    set((state) => ({
      overtimeRecords: state.overtimeRecords.map((ot) =>
        ot.id === id ? { ...ot, status: "accepted", approvedBy: "Supervisor" } : ot
      ),
    }));
  },

  declineOvertime(id) {
    set((state) => ({
      overtimeRecords: state.overtimeRecords.map((ot) =>
        ot.id === id ? { ...ot, status: "declined" } : ot
      ),
    }));
  },
}));

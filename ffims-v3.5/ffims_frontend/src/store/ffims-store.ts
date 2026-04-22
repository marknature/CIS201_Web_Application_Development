"use client";
import { create } from "zustand";
import {
  Driver, WeekRoster, LeaveRequest, OvertimeRecord,
  DayShift, ShiftType, ComplianceViolation,
  Journey, DigitalTicket, AllowancePackage, JourneyStatus,
} from "@/types/ffims-types";
import {
  DRIVERS, INITIAL_ROSTER, LEAVE_REQUESTS, OVERTIME_RECORDS,
  JOURNEYS, DIGITAL_TICKETS, ALLOWANCE_PACKAGES,
} from "@/lib/ffims-data";
import { runComplianceChecks, compliancePercent, fairnessIndex } from "@/lib/compliance";

interface FFIMSStore {
  // Existing state
  drivers: Driver[];
  roster: WeekRoster;
  leaveRequests: LeaveRequest[];
  overtimeRecords: OvertimeRecord[];
  violations: ComplianceViolation[];
  compliancePct: number;
  fairness: number;

  // New state
  journeys: Journey[];
  tickets: DigitalTicket[];
  allowancePackages: AllowancePackage[];

  // Roster actions
  swapShifts: (aId: number, aDay: number, bId: number, bDay: number) => void;
  updateShift: (driverId: number, dayIdx: number, type: ShiftType) => void;
  assignJourneyToShift: (driverId: number, dayIdx: number, journeyId: string) => void;

  // Leave actions
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;

  // OT actions
  approveOvertime: (id: string) => void;
  declineOvertime: (id: string) => void;

  // Journey actions
  addJourney: (journey: Journey) => void;
  updateJourneyStatus: (id: string, status: JourneyStatus, delayMin?: number) => void;
  completeJourney: (id: string) => void;

  // Ticket actions
  redeemTicket: (id: string) => void;

  // GPS simulation
  updateDriverGps: (driverId: number, lat: number, lng: number) => void;
}

function recompute(roster: WeekRoster, drivers: Driver[]) {
  const violations = runComplianceChecks(roster.roster, drivers);
  return { violations, compliancePct: compliancePercent(violations), fairness: fairnessIndex(drivers) };
}

export const useFFIMSStore = create<FFIMSStore>((set) => ({
  drivers: DRIVERS,
  roster: INITIAL_ROSTER,
  leaveRequests: LEAVE_REQUESTS,
  overtimeRecords: OVERTIME_RECORDS,
  journeys: JOURNEYS,
  tickets: DIGITAL_TICKETS,
  allowancePackages: ALLOWANCE_PACKAGES,
  ...recompute(INITIAL_ROSTER, DRIVERS),

  swapShifts(aId, aDay, bId, bDay) {
    set((s) => {
      const r = { ...s.roster, roster: { ...s.roster.roster } };
      const aS = [...r.roster[aId]]; const bS = [...r.roster[bId]];
      const tmp = { ...aS[aDay] }; aS[aDay] = { ...bS[bDay] }; bS[bDay] = tmp;
      r.roster[aId] = aS; r.roster[bId] = bS;
      return { roster: r, ...recompute(r, s.drivers) };
    });
  },

  updateShift(driverId, dayIdx, type) {
    set((s) => {
      const r = { ...s.roster, roster: { ...s.roster.roster } };
      const shifts = [...r.roster[driverId]];
      shifts[dayIdx] = { ...shifts[dayIdx], type };
      r.roster[driverId] = shifts;
      return { roster: r, ...recompute(r, s.drivers) };
    });
  },

  assignJourneyToShift(driverId, dayIdx, journeyId) {
    set((s) => {
      const r = { ...s.roster, roster: { ...s.roster.roster } };
      const shifts = [...r.roster[driverId]];
      shifts[dayIdx] = { ...shifts[dayIdx], journeyId };
      r.roster[driverId] = shifts;
      return { roster: r };
    });
  },

  approveLeave: (id) => set((s) => ({
    leaveRequests: s.leaveRequests.map((l) =>
      l.id === id ? { ...l, status: "approved", reviewedBy: "Supervisor", reviewedAt: new Date().toISOString() } : l
    ),
  })),

  rejectLeave: (id) => set((s) => ({
    leaveRequests: s.leaveRequests.map((l) =>
      l.id === id ? { ...l, status: "rejected", reviewedBy: "Supervisor", reviewedAt: new Date().toISOString() } : l
    ),
  })),

  approveOvertime: (id) => set((s) => ({
    overtimeRecords: s.overtimeRecords.map((o) =>
      o.id === id ? { ...o, status: "accepted", approvedBy: "Supervisor" } : o
    ),
  })),

  declineOvertime: (id) => set((s) => ({
    overtimeRecords: s.overtimeRecords.map((o) =>
      o.id === id ? { ...o, status: "declined" } : o
    ),
  })),

  addJourney: (journey) => set((s) => ({ journeys: [journey, ...s.journeys] })),

  updateJourneyStatus: (id, status, delayMin) => set((s) => ({
    journeys: s.journeys.map((j) =>
      j.id === id ? { ...j, status, ...(delayMin ? { delayMinutes: delayMin } : {}) } : j
    ),
  })),

  completeJourney: (id) => set((s) => ({
    journeys: s.journeys.map((j) =>
      j.id === id ? { ...j, status: "completed", completedAt: new Date().toISOString() } : j
    ),
    // Auto-mark linked ticket as redeemable
    tickets: s.tickets.map((t) =>
      t.journeyId === id ? { ...t, status: "issued" } : t
    ),
  })),

  redeemTicket: (id) => set((s) => ({
    tickets: s.tickets.map((t) =>
      t.id === id
        ? { ...t, status: "redeemed", redeemedAt: new Date().toISOString(), auditRef: `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${id}` }
        : t
    ),
  })),

  updateDriverGps: (driverId, lat, lng) => set((s) => ({
    drivers: s.drivers.map((d) =>
      d.id === driverId ? { ...d, gpsLat: lat, gpsLng: lng, lastGpsUpdate: new Date().toISOString() } : d
    ),
  })),
}));

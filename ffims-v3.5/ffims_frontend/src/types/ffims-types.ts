// ── Existing types ─────────────────────────────────────────────────────
export type ShiftType = "duty" | "standby" | "leave" | "rest" | "ot";
export type Team = "A" | "B";
export type Role = "supervisor" | "driver" | "admin";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type OvertimeStatus = "proposed" | "accepted" | "declined";

// ── New types ──────────────────────────────────────────────────────────
export type JourneyType = "local" | "long-distance" | "cross-border";
export type JourneyStatus = "scheduled" | "in-progress" | "completed" | "delayed";
export type TicketStatus = "issued" | "redeemed" | "expired";
export type AllowanceType = "local" | "long-distance" | "cross-border" | "early-start" | "overnight";

// ── Core entities ──────────────────────────────────────────────────────
export interface Driver {
  id: number;
  name: string;
  team: Team;
  licenseClass: string;
  skillTags: string[];
  weeklyHours: number;
  seniorityYears: number;
  recentOtHours: number;
  status: ShiftType;
  phone: string;
  // GPS (live)
  gpsLat?: number;
  gpsLng?: number;
  lastGpsUpdate?: string; // ISO timestamp
}

export interface DayShift {
  driverId: number;
  type: ShiftType;
  startTime?: string; // "04:30"
  endTime?: string;
  notes?: string;
  conflictFlag?: boolean;
  journeyId?: string; // linked journey if duty
}

export interface WeekRoster {
  weekId: string;       // "2026-W15"
  startDate: string;    // "2026-04-07"
  roster: Record<number, DayShift[]>;
  lockedBy?: string;
}

// ── Allowance package (lookup table) ──────────────────────────────────
export interface AllowancePackage {
  id: string;
  name: string;                // "Long-Distance Package A"
  type: AllowanceType;
  minDistanceKm: number;
  maxDistanceKm: number;
  rateUsd: number;             // fixed monetary rate
  couponCode: string;          // e.g. "LD-A"
  description: string;
}

// ── Journey ────────────────────────────────────────────────────────────
export interface Journey {
  id: string;
  driverId: number;
  driverName: string;
  date: string;                // "2026-04-07"
  shiftStart: string;          // "04:30"
  destination: string;
  destinationLat: number;
  destinationLng: number;
  originLat: number;
  originLng: number;
  distanceKm: number;
  journeyType: JourneyType;
  status: JourneyStatus;
  allowancePackageId: string;
  estimatedDurationMin: number;
  actualDurationMin?: number;
  etaTimestamp?: string;       // ISO
  delayMinutes?: number;
  completedAt?: string;        // ISO
  notes?: string;
}

// ── Digital Ticket / Coupon ────────────────────────────────────────────
export interface DigitalTicket {
  id: string;
  journeyId: string;
  driverId: number;
  driverName: string;
  allowancePackageId: string;
  couponCode: string;
  rateUsd: number;
  issuedAt: string;            // ISO
  status: TicketStatus;
  redeemedAt?: string;
  auditRef?: string;           // payroll audit reference
}

// ── GPS ping ───────────────────────────────────────────────────────────
export interface GpsPing {
  driverId: number;
  lat: number;
  lng: number;
  speedKmh: number;
  timestamp: string;
  journeyId?: string;
}

// ── Compliance / violations ────────────────────────────────────────────
export interface ComplianceViolation {
  driverId: number;
  driverName: string;
  type: "max_hours" | "rest_period" | "leave_conflict" | "ot_back_to_back" | "journey_fatigue";
  severity: "error" | "warning";
  message: string;
  dayIndex?: number;
}

// ── Leave / OT (unchanged) ─────────────────────────────────────────────
export interface LeaveRequest {
  id: string;
  driverId: number;
  driverName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface OvertimeRecord {
  id: string;
  driverId: number;
  driverName: string;
  date: string;
  hours: number;
  rate: number;
  reason: string;
  status: OvertimeStatus;
  approvedBy?: string;
  journeyDistanceKm?: number;  // new — linked journey distance
  allowancePackageId?: string; // new — linked allowance
}

export interface SkillMatchResult {
  driverId: number;
  driverName: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface KPISummary {
  onDutyToday: number;
  onLeave: number;
  weeklyOtHours: number;
  compliancePercent: number;
  standbyAvailable: number;
  fairnessIndex: number;
  activeJourneys: number;
  pendingTickets: number;
}

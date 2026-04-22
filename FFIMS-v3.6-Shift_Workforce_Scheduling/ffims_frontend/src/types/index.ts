export type ShiftType = "duty" | "standby" | "leave" | "rest" | "ot";
export type Team = "A" | "B";
export type Role = "supervisor" | "driver" | "admin";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type OvertimeStatus = "proposed" | "accepted" | "declined";

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
}

export interface DayShift {
  driverId: number;
  type: ShiftType;
  startTime?: string;
  endTime?: string;
  notes?: string;
  conflictFlag?: boolean;
}

export interface WeekRoster {
  weekId: string;
  startDate: string;
  roster: Record<number, DayShift[]>;
  lockedBy?: string;
}

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
}

export interface ComplianceViolation {
  driverId: number;
  driverName: string;
  type: "max_hours" | "rest_period" | "leave_conflict" | "ot_back_to_back";
  severity: "error" | "warning";
  message: string;
  dayIndex?: number;
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
}

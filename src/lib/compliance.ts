import { DayShift, ComplianceViolation, Driver } from "@/types";

const MAX_WEEKLY_HOURS = 45;
const MIN_REST_BETWEEN_SHIFTS_H = 11;

export function getWeeklyHours(shifts: DayShift[]): number {
  return shifts.reduce((acc, s) => {
    if (s.type === "duty" || s.type === "standby") return acc + 8;
    if (s.type === "ot") return acc + 4;
    return acc;
  }, 0);
}

export function runComplianceChecks(
  roster: Record<number, DayShift[]>,
  drivers: Driver[]
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  drivers.forEach((driver) => {
    const shifts = roster[driver.id];
    if (!shifts) return;

    // 1. Max weekly hours
    const hours = getWeeklyHours(shifts);
    if (hours > MAX_WEEKLY_HOURS) {
      violations.push({
        driverId: driver.id,
        driverName: driver.name,
        type: "max_hours",
        severity: "error",
        message: `${driver.name} has ${hours}h this week — exceeds Zimbabwe Labor Act ${MAX_WEEKLY_HOURS}h limit.`,
      });
    } else if (hours >= 42) {
      violations.push({
        driverId: driver.id,
        driverName: driver.name,
        type: "max_hours",
        severity: "warning",
        message: `${driver.name} is at ${hours}h — approaching the ${MAX_WEEKLY_HOURS}h threshold.`,
      });
    }

    // 2. Leave conflict: duty assigned while on approved leave
    shifts.forEach((shift, dayIdx) => {
      if (shift.conflictFlag) {
        violations.push({
          driverId: driver.id,
          driverName: driver.name,
          type: "leave_conflict",
          severity: "error",
          message: `${driver.name} has a duty conflict on day ${dayIdx + 1} — overlaps with approved leave.`,
          dayIndex: dayIdx,
        });
      }
    });

    // 3. OT followed immediately by duty (insufficient rest)
    shifts.forEach((shift, i) => {
      if (shift.type === "ot" && i < shifts.length - 1 && shifts[i + 1].type === "duty") {
        violations.push({
          driverId: driver.id,
          driverName: driver.name,
          type: "rest_period",
          severity: "warning",
          message: `${driver.name}: Overtime on day ${i + 1} is followed by duty on day ${i + 2} — check ${MIN_REST_BETWEEN_SHIFTS_H}h rest period.`,
          dayIndex: i,
        });
      }
    });

    // 4. OT back-to-back on consecutive days
    shifts.forEach((shift, i) => {
      if (shift.type === "ot" && i < shifts.length - 1 && shifts[i + 1].type === "ot") {
        violations.push({
          driverId: driver.id,
          driverName: driver.name,
          type: "ot_back_to_back",
          severity: "warning",
          message: `${driver.name}: Back-to-back overtime on days ${i + 1}–${i + 2}.`,
          dayIndex: i,
        });
      }
    });
  });

  return violations;
}

export function compliancePercent(violations: ComplianceViolation[]): number {
  const errors = violations.filter((v) => v.severity === "error").length;
  const warnings = violations.filter((v) => v.severity === "warning").length;
  return Math.max(0, Math.round(100 - errors * 10 - warnings * 3));
}

/** Fairness index: lower spread in overtime hours = higher index */
export function fairnessIndex(drivers: Driver[]): number {
  const hours = drivers.map((d) => d.recentOtHours);
  const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
  const variance = hours.reduce((acc, h) => acc + Math.pow(h - mean, 2), 0) / hours.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, Math.round(100 - stdDev * 5));
}

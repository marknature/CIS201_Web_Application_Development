import { Driver, SkillMatchResult } from "@/types";

// All known skill tags in the system
export const ALL_SKILLS = [
  "bus", "van", "hgv", "long-route", "night-duty", "light-duty",
  "events", "specialist", "garden", "brush-cut",
];

function buildVector(tags: string[]): number[] {
  return ALL_SKILLS.map((skill) => (tags.includes(skill) ? 1 : 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function matchDriversToTask(
  requiredSkills: string[],
  drivers: Driver[]
): SkillMatchResult[] {
  const reqVector = buildVector(requiredSkills);

  return drivers
    .map((driver) => {
      const driverVector = buildVector(driver.skillTags);
      const score = cosineSimilarity(reqVector, driverVector);
      const matchedSkills = requiredSkills.filter((s) => driver.skillTags.includes(s));
      const missingSkills = requiredSkills.filter((s) => !driver.skillTags.includes(s));
      return { driverId: driver.id, driverName: driver.name, score, matchedSkills, missingSkills };
    })
    .sort((a, b) => b.score - a.score);
}

/** OT fairness scoring: lower recentOtHours + higher seniority = higher priority */
export function overtimeFairnessRanking(drivers: Driver[]): Driver[] {
  return [...drivers].sort((a, b) => {
    if (a.recentOtHours !== b.recentOtHours) return a.recentOtHours - b.recentOtHours;
    return b.seniorityYears - a.seniorityYears;
  });
}

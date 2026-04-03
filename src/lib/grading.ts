/**
 * GradeABeef — centralized grading algorithm
 *
 * Grade scale (1–4):
 *   4 = Job ✓  Tech ✓   (both positive)
 *   3 = Job ✓  Tech ✗   (job positive, tech negative)
 *   2 = Job ✗  Tech ✓   (job negative, tech positive)
 *   1 = Job ✗  Tech ✗   (both negative)
 *
 * Job %   = snaps where grade >= 3  / total snaps × 100
 * Tech %  = snaps where grade is 4 or 2 / total snaps × 100
 * Final % = (jobCount + techCount) / (total snaps × 2) × 100
 */

export interface GradeValue {
  value: number;
}

export interface GradeStats {
  snaps: number;
  jobCount: number;
  techCount: number;
  jobPct: number;
  techPct: number;
  finalPct: number;
}

/** True if the grade value counts as a positive job execution */
export function isJobPositive(v: number): boolean {
  return v >= 3;
}

/** True if the grade value counts as a positive technique execution */
export function isTechPositive(v: number): boolean {
  return v === 4 || v === 2;
}

/**
 * Core grading algorithm.
 * Pass any array of grade objects that have a numeric `value` field.
 * Returns counts and rounded percentages for job, tech, and final.
 */
export function calcGradeStats(grades: GradeValue[]): GradeStats {
  const snaps = grades.length;
  if (snaps === 0) {
    return { snaps: 0, jobCount: 0, techCount: 0, jobPct: 0, techPct: 0, finalPct: 0 };
  }

  const jobCount  = grades.filter((g) => isJobPositive(g.value)).length;
  const techCount = grades.filter((g) => isTechPositive(g.value)).length;

  return {
    snaps,
    jobCount,
    techCount,
    jobPct:   Math.round((jobCount / snaps) * 100),
    techPct:  Math.round((techCount / snaps) * 100),
    finalPct: Math.round(((jobCount + techCount) / (snaps * 2)) * 100),
  };
}

/**
 * Colour helper — returns a Tailwind text class based on a percentage.
 * ≥ 80%  → green
 * ≥ 60%  → yellow
 * < 60%  → red
 */
export function pctColorClass(pct: number | null): string {
  if (pct === null) return "text-white/30";
  if (pct >= 80) return "text-green-400";
  if (pct >= 60) return "text-yellow-400";
  return "text-red-500";
}

/**
 * Background colour class for an individual grade cell.
 */
export function gradeBgClass(v: number): string {
  switch (v) {
    case 4: return "bg-green-500/15";
    case 3: return "bg-yellow-500/15";
    case 2: return "bg-orange-500/15";
    case 1: return "bg-red-500/15";
    default: return "";
  }
}

/**
 * Text colour class for an individual grade value.
 */
export function gradeColorClass(v: number): string {
  switch (v) {
    case 4: return "text-green-400";
    case 3: return "text-yellow-400";
    case 2: return "text-orange-400";
    case 1: return "text-red-500";
    default: return "text-white/30";
  }
}

/**
 * Team average — averages a single stat field across all graded players.
 * Returns null when no players have snaps yet.
 */
export function teamAvg(
  playerStats: { snaps: number; jobPct: number; techPct: number; finalPct: number }[],
  field: "jobPct" | "techPct" | "finalPct"
): number | null {
  const graded = playerStats.filter((p) => p.snaps > 0);
  if (!graded.length) return null;
  return Math.round(graded.reduce((sum, p) => sum + p[field], 0) / graded.length);
}

/**
 * Returns the player object with the highest value for a given stat field,
 * or null if no players have snaps.
 */
export function topPerformer<T extends { snaps: number; jobPct: number; techPct: number; finalPct: number }>(
  playerStats: T[],
  field: "jobPct" | "techPct" | "finalPct"
): T | null {
  const graded = playerStats.filter((p) => p.snaps > 0);
  if (!graded.length) return null;
  return graded.reduce((best, p) => (p[field] > best[field] ? p : best));
}

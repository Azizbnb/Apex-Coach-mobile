/**
 * Fasting Date Calculation Module
 * APEX COACH
 *
 * Calculates which program weeks overlap with a fasting period.
 * Used to automatically determine which training weeks should be adapted.
 *
 * Supports all types of fasting: Ramadan, Lent (Carême), intermittent fasting,
 * therapeutic fasting, and any other user-defined fasting period.
 */

/**
 * Fasting level determines how the AI adapts the training program
 */
export type FastingLevel = 'strict' | 'moderate' | 'light'

/**
 * Display names for fasting levels (French)
 */
export const FASTING_LEVEL_LABELS: Record<FastingLevel, string> = {
  strict: 'Strict',
  moderate: 'Modéré',
  light: 'Souple',
}

/**
 * Descriptions for fasting levels (French)
 */
export const FASTING_LEVEL_DESCRIPTIONS: Record<FastingLevel, string> = {
  strict: 'Aucune nourriture ni eau jusqu\'au soir (ex : Ramadan)',
  moderate: 'Eau autorisée, alimentation très réduite (ex : Carême strict, jeûne thérapeutique)',
  light: 'Restrictions alimentaires ciblées (ex : pas de viande certains jours, repas allégés)',
}

/**
 * Icons for fasting levels
 */
export const FASTING_LEVEL_ICONS: Record<FastingLevel, string> = {
  strict: '🚫',
  moderate: '💧',
  light: '🍃',
}

/**
 * Calculate overlap between two date ranges
 * Returns number of days that overlap between the two ranges
 *
 * @param range1Start - Start of first date range
 * @param range1End - End of first date range
 * @param range2Start - Start of second date range
 * @param range2End - End of second date range
 * @returns Number of days that overlap (0 if no overlap)
 */
function calculateOverlapDays(
  range1Start: Date,
  range1End: Date,
  range2Start: Date,
  range2End: Date
): number {
  // Find the latest start date and earliest end date
  const overlapStart = new Date(Math.max(range1Start.getTime(), range2Start.getTime()))
  const overlapEnd = new Date(Math.min(range1End.getTime(), range2End.getTime()))

  // No overlap if end is before start
  if (overlapEnd < overlapStart) return 0

  // Calculate days of overlap (inclusive, so add 1)
  const daysOverlap = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return daysOverlap
}

/**
 * Calculate which program weeks fall during a fasting period
 *
 * Uses a threshold-based approach: if 4+ days of a week overlap with the fasting period,
 * the entire week is considered a "fasting week" and receives adaptations.
 *
 * Example:
 *   Program starts: March 10, 2026
 *   Fasting: March 1-30, 2026
 *   Week 1 (March 10-16): 7 days overlap → ✅ Fasting week
 *   Week 2 (March 17-23): 7 days overlap → ✅ Fasting week
 *   Week 3 (March 24-30): 7 days overlap → ✅ Fasting week
 *   Week 4 (March 31-April 6): 0 days overlap → ❌ Normal week
 *   Result: [1, 2, 3]
 *
 * @param programStartDate - Date the program starts (subscription.current_period_start or today for Starter)
 * @param fastingStartDate - First day of fasting period
 * @param fastingEndDate - Last day of fasting period
 * @param totalWeeks - Total weeks in program (default: 4)
 * @param minOverlapDays - Minimum days overlap to consider a week as "fasting week" (default: 4 = majority)
 * @returns Array of week numbers that fall during fasting period (e.g., [1, 2, 3])
 */
export function calculateFastingWeeks(
  programStartDate: Date,
  fastingStartDate: Date,
  fastingEndDate: Date,
  totalWeeks: number = 4,
  minOverlapDays: number = 4
): number[] {
  const fastingWeeks: number[] = []

  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    // Calculate week boundaries
    const weekStart = new Date(programStartDate)
    weekStart.setDate(programStartDate.getDate() + (weekNum - 1) * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // 7-day week (days 0-6)

    // Calculate how many days this week overlaps with fasting period
    const overlapDays = calculateOverlapDays(
      weekStart,
      weekEnd,
      fastingStartDate,
      fastingEndDate
    )

    // If 4+ days overlap (majority of week), mark as fasting week
    if (overlapDays >= minOverlapDays) {
      fastingWeeks.push(weekNum)
    }
  }

  return fastingWeeks
}

/**
 * Check if a specific week is during a fasting period
 *
 * Convenience function for checking a single week instead of calculating all weeks.
 *
 * @param programStartDate - Date the program starts
 * @param weekNumber - Week number to check (1-based)
 * @param fastingStartDate - First day of fasting period
 * @param fastingEndDate - Last day of fasting period
 * @returns true if the week falls during the fasting period
 */
export function isWeekInFastingPeriod(
  programStartDate: Date,
  weekNumber: number,
  fastingStartDate: Date,
  fastingEndDate: Date
): boolean {
  const weeks = calculateFastingWeeks(programStartDate, fastingStartDate, fastingEndDate, weekNumber)
  return weeks.includes(weekNumber)
}

/**
 * Format date range for display in French
 *
 * Example: "1 mars 2026 - 30 mars 2026"
 *
 * @param startDate - ISO date string (YYYY-MM-DD)
 * @param endDate - ISO date string (YYYY-MM-DD)
 * @returns Formatted date range in French
 */
export function formatFastingPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `${formatter.format(start)} - ${formatter.format(end)}`
}

/**
 * Check if current date is within fasting period
 * Used to handle multi-cycle scenarios
 *
 * @param startDate - Fasting start date (ISO string)
 * @param endDate - Fasting end date (ISO string)
 * @returns true if current date is within fasting period
 */
export function isCurrentlyFasting(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): boolean {
  if (!startDate || !endDate) return false

  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  return now >= start && now <= end
}

// ==========================================
// BACKWARD COMPATIBILITY (deprecated)
// ==========================================

/** @deprecated Use calculateFastingWeeks instead */
export const calculateRamadanWeeks = calculateFastingWeeks

/** @deprecated Use isWeekInFastingPeriod instead */
export const isWeekInRamadan = isWeekInFastingPeriod

/** @deprecated Use formatFastingPeriod instead */
export const formatRamadanPeriod = formatFastingPeriod

/** @deprecated Use isCurrentlyFasting instead */
export const isCurrentlyRamadan = isCurrentlyFasting

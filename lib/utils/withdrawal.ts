/**
 * Utility functions for specialist withdrawal rules:
 * - Regular withdrawal dates: Day 15 and the last day of each month.
 * - Extraordinary withdrawals: Any other day of the month, requiring and consuming 50 Arcanas.
 */

export const EXTRAORDINARY_WITHDRAWAL_ARCANA_COST = 50

/**
 * Checks if a given date is a regular withdrawal date (day 15 or last day of month).
 */
export function isRegularWithdrawalDate(date: Date = new Date(), timeZone = 'America/La_Paz'): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
    const parts = formatter.formatToParts(date)
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10)
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10)
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10)

    if (day === 15) {
      return true
    }

    const lastDayOfMonth = new Date(year, month, 0).getDate()
    if (day === lastDayOfMonth) {
      return true
    }

    return false
  } catch {
    const day = date.getDate()
    if (day === 15) {
      return true
    }

    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    return day === lastDayOfMonth
  }
}

/**
 * Returns a human-friendly description of the withdrawal cost and rules for a given date and balance.
 */
export function getWithdrawalRuleInfo(date: Date = new Date(), currentArcanas: number = 0) {
  const isRegular = isRegularWithdrawalDate(date)
  return {
    isRegular,
    arcanaCost: isRegular ? 0 : EXTRAORDINARY_WITHDRAWAL_ARCANA_COST,
    hasEnoughArcanas: isRegular || currentArcanas >= EXTRAORDINARY_WITHDRAWAL_ARCANA_COST,
    canWithdraw: isRegular || currentArcanas >= EXTRAORDINARY_WITHDRAWAL_ARCANA_COST,
  }
}

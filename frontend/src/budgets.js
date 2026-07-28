import { categoryTotals, currentMonthKey } from './breakdown.js'

export const WARN_RATIO = 0.8

export function budgetStatuses(expenses, budgets) {
  const totals = categoryTotals(expenses, currentMonthKey())
  return Object.entries(budgets || {})
    .map(([category, limit]) => {
      const spent = totals.get(category) || 0
      const ratio = spent / limit
      const level = ratio >= 1 ? 'over' : ratio >= WARN_RATIO ? 'warn' : 'ok'
      return { category, limit, spent, ratio, level }
    })
    .sort((a, b) => b.ratio - a.ratio)
}

export function budgetBarClass(ratio) {
  if (ratio < 0.3) return 'bg-sage'
  if (ratio < 0.6) return 'bg-accent-300'
  if (ratio < 0.8) return 'bg-accent-400'
  return 'bg-danger'
}

export function safeToSpend(expenses, budgets) {
  const statuses = budgetStatuses(expenses, budgets)
  if (statuses.length === 0) return null
  const limit = statuses.reduce((sum, status) => sum + status.limit, 0)
  const spent = statuses.reduce((sum, status) => sum + status.spent, 0)
  return limit - spent
}

function overshootPercent(status) {
  return Math.round((status.ratio - 1) * 100)
}

function warnClause(warn) {
  if (warn.length === 0) return ''
  if (warn.length === 1) return `, and ${warn[0].category} is close to its limit`
  return `, and ${warn.length} others are close to their limits`
}

export function budgetHeadline(expenses, budgets) {
  const statuses = budgetStatuses(expenses, budgets)
  if (statuses.length === 0) return 'Set a budget to start tracking your limits.'

  const over = statuses.filter((status) => status.level === 'over')
  const warn = statuses.filter((status) => status.level === 'warn')

  if (over.length === 0 && warn.length === 0) return 'Every budget is on track this month.'

  const onTrackCount = statuses.length - over.length - warn.length
  const restClause = onTrackCount > 0 ? ' — everything else is on track.' : '.'

  if (over.length === 0) {
    if (warn.length === 1) return `${warn[0].category} is close to its limit${restClause}`
    return `${warn.length} budgets are close to their limits, ${warn[0].category} most of all${restClause}`
  }

  const worst = over[0]
  const overshoot = overshootPercent(worst)

  if (over.length === 1) {
    const lead =
      overshoot > 0
        ? `${worst.category} is ${overshoot}% over budget`
        : `${worst.category} is right at its limit`
    return warn.length === 0 ? `${lead}${restClause}` : `${lead}${warnClause(warn)}${restClause}`
  }

  const lead =
    overshoot > 0
      ? `${over.length} budgets are over, ${worst.category} worst at ${overshoot}%`
      : `${over.length} budgets are over, ${worst.category} furthest along`
  return warn.length === 0 ? `${lead}${restClause}` : `${lead}${warnClause(warn)}${restClause}`
}

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
  if (ratio < 0.6) return 'bg-butter'
  if (ratio < 0.8) return 'bg-notice'
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
  if (warn.length === 1) return `, and ${warn[0].category} is getting toasty`
  return `, and ${warn.length} others are getting toasty`
}

export function budgetHeadline(expenses, budgets) {
  const statuses = budgetStatuses(expenses, budgets)
  if (statuses.length === 0) return "Let's get a budget in the oven!"

  const over = statuses.filter((status) => status.level === 'over')
  const warn = statuses.filter((status) => status.level === 'warn')

  if (over.length === 0 && warn.length === 0) return 'Every budget is rising beautifully this month!'

  const onTrackCount = statuses.length - over.length - warn.length
  const restClause = onTrackCount > 0 ? ' — the rest are rising nicely!' : '!'

  if (over.length === 0) {
    if (warn.length === 1) return `Careful, ${warn[0].category} is getting toasty${restClause}`
    return `${warn.length} budgets are getting toasty, ${warn[0].category} most of all${restClause}`
  }

  const worst = over[0]
  const overshoot = overshootPercent(worst)

  if (over.length === 1) {
    const lead =
      overshoot > 0
        ? `Oof, ${worst.category} is ${overshoot}% over budget`
        : `${worst.category} is right at the crust`
    return warn.length === 0 ? `${lead}${restClause}` : `${lead}${warnClause(warn)}${restClause}`
  }

  const lead =
    overshoot > 0
      ? `${over.length} budgets are overdone, ${worst.category} crispiest at ${overshoot}%`
      : `${over.length} budgets are overdone, ${worst.category} furthest along`
  return warn.length === 0 ? `${lead}${restClause}` : `${lead}${warnClause(warn)}${restClause}`
}

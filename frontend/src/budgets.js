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

export function safeToSpend(expenses, budgets) {
  const statuses = budgetStatuses(expenses, budgets)
  if (statuses.length === 0) return null
  const limit = statuses.reduce((sum, status) => sum + status.limit, 0)
  const spent = statuses.reduce((sum, status) => sum + status.spent, 0)
  return limit - spent
}

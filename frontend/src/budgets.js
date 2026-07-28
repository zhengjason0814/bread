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

export function budgetHeadline(expenses, budgets) {
  const statuses = budgetStatuses(expenses, budgets)
  if (statuses.length === 0) return 'Set a budget to start tracking your limits.'
  const over = statuses.find((status) => status.level === 'over')
  if (over) {
    return `${over.category} is ${Math.round((over.ratio - 1) * 100)}% over budget — everything else is on track.`
  }
  const warn = statuses.find((status) => status.level === 'warn')
  if (warn) return `${warn.category} is close to its limit — everything else is on track.`
  return 'Every budget is on track this month.'
}

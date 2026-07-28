const MONTHLY_FACTORS = { weekly: 4.33, biweekly: 2.17, monthly: 1, yearly: 1 / 12 }

export function monthlyFactor(cadence) {
  if (cadence in MONTHLY_FACTORS) return MONTHLY_FACTORS[cadence]
  const match = cadence.match(/~(\d+) days/)
  return match ? 30.44 / Number(match[1]) : 1
}

export function formatNextDate(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function recurringMonthlyTotal(series) {
  return series.reduce((sum, entry) => sum + entry.typical_amount * monthlyFactor(entry.cadence), 0)
}

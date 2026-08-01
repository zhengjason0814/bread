const cache = require('./cache')

const PAST_TTL_SECONDS = 60 * 60 * 24 * 30
const TODAY_TTL_SECONDS = 60 * 60

function toRateDate(date) {
  const requested = new Date(date)
  const today = new Date()
  const effective = requested > today ? today : requested
  return effective.toISOString().slice(0, 10)
}

async function getRateTable(base, date) {
  const key = `fx:${base}:${date}`
  const cached = await cache.getJson(key)
  if (cached) {
    return cached
  }

  let rates = null
  try {
    const response = await fetch(`https://api.frankfurter.dev/v1/${date}?base=${base}`)
    if (response.ok) {
      const data = await response.json()
      rates = data.rates
    }
  } catch {
    rates = null
  }

  if (rates) {
    const today = new Date().toISOString().slice(0, 10)
    const ttl = date === today ? TODAY_TTL_SECONDS : PAST_TTL_SECONDS
    await cache.setJson(key, rates, ttl)
  }
  return rates
}

async function convertExpenses(expenses, baseCurrency) {
  const base = (baseCurrency || 'USD').toUpperCase()
  const plains = expenses.map((expense) => (expense.toObject ? expense.toObject() : expense))

  const neededDates = new Set()
  for (const plain of plains) {
    const native = (plain.currency || 'USD').toUpperCase()
    if (native !== base) neededDates.add(toRateDate(plain.date))
  }

  const ratesByDate = new Map(
    await Promise.all(
      [...neededDates].map(async (date) => [date, await getRateTable(base, date)])
    )
  )

  return plains.map((plain) => {
    const native = (plain.currency || 'USD').toUpperCase()

    let convertedAmount
    if (native === base) {
      convertedAmount = plain.amount
    } else {
      const rates = ratesByDate.get(toRateDate(plain.date))
      const perBase = rates?.[native]
      convertedAmount = perBase ? Math.round((plain.amount / perBase) * 100) / 100 : null
    }

    return { ...plain, currency: native, convertedAmount, baseCurrency: base }
  })
}

async function convertAccountBalances(accounts, baseCurrency) {
  const base = (baseCurrency || 'USD').toUpperCase()
  const today = new Date().toISOString().slice(0, 10)
  const plains = accounts.map((account) => (account.toObject ? account.toObject() : account))

  const needsRates = plains.some((plain) => {
    const native = (plain.currency || 'USD').toUpperCase()
    return typeof plain.balance === 'number' && native !== base
  })
  const rates = needsRates ? await getRateTable(base, today) : null

  return plains.map((plain) => {
    const native = (plain.currency || 'USD').toUpperCase()

    let convertedBalance = null
    if (typeof plain.balance === 'number') {
      if (native === base) {
        convertedBalance = plain.balance
      } else {
        const perBase = rates?.[native]
        convertedBalance = perBase ? Math.round((plain.balance / perBase) * 100) / 100 : null
      }
    }

    return { ...plain, convertedBalance, baseCurrency: base }
  })
}

async function __clearCache() {
  await cache.__flush()
}

module.exports = { convertExpenses, convertAccountBalances, __clearCache }

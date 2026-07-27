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
  const converted = []

  for (const expense of expenses) {
    const plain = expense.toObject ? expense.toObject() : expense
    const native = (plain.currency || 'USD').toUpperCase()

    let convertedAmount
    if (native === base) {
      convertedAmount = plain.amount
    } else {
      const rates = await getRateTable(base, toRateDate(plain.date))
      const perBase = rates?.[native]
      convertedAmount = perBase ? Math.round((plain.amount / perBase) * 100) / 100 : null
    }

    converted.push({ ...plain, currency: native, convertedAmount, baseCurrency: base })
  }

  return converted
}

async function convertAccountBalances(accounts, baseCurrency) {
  const base = (baseCurrency || 'USD').toUpperCase()
  const today = new Date().toISOString().slice(0, 10)
  const converted = []

  for (const account of accounts) {
    const plain = account.toObject ? account.toObject() : account
    const native = (plain.currency || 'USD').toUpperCase()

    let convertedBalance = null
    if (typeof plain.balance === 'number') {
      if (native === base) {
        convertedBalance = plain.balance
      } else {
        const rates = await getRateTable(base, today)
        const perBase = rates?.[native]
        convertedBalance = perBase ? Math.round((plain.balance / perBase) * 100) / 100 : null
      }
    }

    converted.push({ ...plain, convertedBalance, baseCurrency: base })
  }

  return converted
}

async function __clearCache() {
  await cache.__flush()
}

module.exports = { convertExpenses, convertAccountBalances, __clearCache }

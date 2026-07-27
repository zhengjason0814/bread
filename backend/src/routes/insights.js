const express = require('express')
const Expense = require('../models/Expense')
const User = require('../models/User')
const requireAuth = require('../middleware/auth')
const { convertExpenses } = require('../services/exchangeRates')
const { isSpend } = require('../services/spendFilter')
const mlClient = require('../services/mlClient')
const cache = require('../services/cache')
const { insightsKey, INSIGHT_TTL_SECONDS } = require('../services/insightsCache')

const router = express.Router()
router.use(requireAuth)

async function loadConvertibleExpenses(userId) {
  const user = await User.findById(userId).select('baseCurrency')
  const expenses = await Expense.find({ user: userId }).lean()
  const converted = await convertExpenses(expenses, user.baseCurrency)
  const usable = converted.filter(
    (expense) => typeof expense.convertedAmount === 'number' && isSpend(expense)
  )
  return { usable, baseCurrency: user.baseCurrency }
}

function isoDay(value) {
  return new Date(value).toISOString().slice(0, 10)
}

router.get('/prediction', async (req, res) => {
  const key = insightsKey(req.userId, 'prediction')
  const cached = await cache.getJson(key)
  if (cached) {
    res.set('X-Cache', 'HIT')
    return res.json(cached)
  }

  const { usable, baseCurrency } = await loadConvertibleExpenses(req.userId)
  const points = usable.map((expense) => ({
    date: isoDay(expense.date),
    amount: expense.convertedAmount,
  }))

  res.set('X-Cache', 'MISS')
  try {
    const result = await mlClient.predict(points, isoDay(new Date()))
    const body = { ...result, baseCurrency }
    await cache.setJson(key, body, INSIGHT_TTL_SECONDS)
    res.json(body)
  } catch {
    res.json({ status: 'unavailable', baseCurrency })
  }
})

router.get('/anomalies', async (req, res) => {
  const key = insightsKey(req.userId, 'anomalies')
  const cached = await cache.getJson(key)
  if (cached) {
    res.set('X-Cache', 'HIT')
    return res.json(cached)
  }

  const { usable, baseCurrency } = await loadConvertibleExpenses(req.userId)
  const items = usable
    .filter((expense) => expense.category !== 'Other')
    .map((expense) => ({
      id: String(expense._id),
      category: expense.category,
      amount: expense.convertedAmount,
      date: isoDay(expense.date),
    }))

  res.set('X-Cache', 'MISS')
  try {
    const result = await mlClient.detectAnomalies(items)
    const dismissed = new Set(
      usable
        .filter((expense) => expense.anomalyDismissed)
        .map((expense) => String(expense._id))
    )
    const anomalies = result.anomalies.filter((anomaly) => !dismissed.has(anomaly.id))
    const body = { ...result, anomalies, baseCurrency }
    await cache.setJson(key, body, INSIGHT_TTL_SECONDS)
    res.json(body)
  } catch {
    res.json({ status: 'unavailable', anomalies: [], baseCurrency })
  }
})

router.get('/suggest-category', async (req, res) => {
  const text = (req.query.text || '').trim()
  if (!text) {
    return res.status(400).json({ error: 'text is required' })
  }

  try {
    const result = await mlClient.classify(text)
    res.json(result)
  } catch {
    res.json({ status: 'unavailable' })
  }
})

router.get('/recurring', async (req, res) => {
  const key = insightsKey(req.userId, 'recurring')
  const cached = await cache.getJson(key)
  if (cached) {
    res.set('X-Cache', 'HIT')
    return res.json(cached)
  }

  const { usable, baseCurrency } = await loadConvertibleExpenses(req.userId)
  const items = usable.map((expense) => ({
    id: String(expense._id),
    text: expense.merchant || expense.note,
    amount: expense.convertedAmount,
    date: isoDay(expense.date),
  }))

  res.set('X-Cache', 'MISS')
  try {
    const result = await mlClient.detectRecurring(items)
    const body = { ...result, baseCurrency }
    await cache.setJson(key, body, INSIGHT_TTL_SECONDS)
    res.json(body)
  } catch {
    res.json({ status: 'unavailable', baseCurrency })
  }
})

module.exports = router

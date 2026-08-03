const axios = require('axios')

const INTERACTIVE_TIMEOUT_MS = 3000
const DEFAULT_INSIGHT_TIMEOUT_MS = 40000
const INSIGHT_TIMEOUT_MS = Number(process.env.ML_INSIGHT_TIMEOUT_MS) || DEFAULT_INSIGHT_TIMEOUT_MS
const WAKE_TIMEOUT_MS = 60000
const WAKE_THROTTLE_MS = 60000

const client = axios.create({
  baseURL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  timeout: INTERACTIVE_TIMEOUT_MS,
})

const insightRequest = { timeout: INSIGHT_TIMEOUT_MS }

async function predict(expenses, asOf) {
  const { data } = await client.post('/predict', { as_of: asOf, expenses }, insightRequest)
  return data
}

async function classify(text) {
  const { data } = await client.post('/classify', { text })
  return data
}

async function detectAnomalies(expenses) {
  const { data } = await client.post('/anomalies', { expenses }, insightRequest)
  return data
}

async function detectRecurring(expenses) {
  const { data } = await client.post('/recurring', { expenses }, insightRequest)
  return data
}

let lastWakeAt = 0

function wake() {
  if (process.env.NODE_ENV === 'test') return
  if (Date.now() - lastWakeAt < WAKE_THROTTLE_MS) return
  lastWakeAt = Date.now()
  client.get('/health', { timeout: WAKE_TIMEOUT_MS }).catch(() => {})
}

module.exports = { predict, classify, detectAnomalies, detectRecurring, wake }

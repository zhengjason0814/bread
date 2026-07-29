const axios = require('axios')

const INTERACTIVE_TIMEOUT_MS = 3000
const INSIGHT_TIMEOUT_MS = Number(process.env.ML_INSIGHT_TIMEOUT_MS) || INTERACTIVE_TIMEOUT_MS

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

module.exports = { predict, classify, detectAnomalies, detectRecurring }

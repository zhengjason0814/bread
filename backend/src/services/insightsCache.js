const cache = require('./cache')

const INSIGHT_TYPES = ['prediction', 'anomalies', 'recurring']
const INSIGHT_TTL_SECONDS = 600

function insightsKey(userId, type) {
  return `insights:${userId}:${type}`
}

async function clearInsightsCache(userId) {
  await cache.clearKeys(INSIGHT_TYPES.map((type) => insightsKey(userId, type)))
}

module.exports = { INSIGHT_TYPES, INSIGHT_TTL_SECONDS, insightsKey, clearInsightsCache }

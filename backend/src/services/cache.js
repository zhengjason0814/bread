const redis = require('../config/redis')

async function getJson(key) {
  try {
    const raw = await redis.get(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function setJson(key, value, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
  }
}

async function clearKeys(keys) {
  try {
    if (keys.length) await redis.del(...keys)
  } catch {
  }
}

async function __flush() {
  try {
    await redis.flushall()
  } catch {
  }
}

module.exports = { getJson, setJson, clearKeys, __flush }

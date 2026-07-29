const rateLimit = require('express-rate-limit')

const FALLBACK_RETRY_SECONDS = 60

function secondsUntilReset(req) {
  const resetTime = req.rateLimit?.resetTime
  if (!resetTime) return FALLBACK_RETRY_SECONDS
  return Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
}

function tooManyRequests(message) {
  return (req, res) => {
    const retryAfter = secondsUntilReset(req)
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({ error: message, retryAfter })
  }
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: () => Number(process.env.AUTH_RATELIMIT_MAX) || 10,
  skip: () => process.env.NODE_ENV === 'test' && process.env.AUTH_RATELIMIT_TEST !== '1',
  handler: tooManyRequests('Too many sign-in attempts — the oven needs a minute.'),
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: () => Number(process.env.API_RATELIMIT_MAX) || 100,
  skip: () => process.env.NODE_ENV === 'test' && process.env.API_RATELIMIT_TEST !== '1',
  handler: tooManyRequests('Too many requests — the oven needs a minute.'),
})

module.exports = { authLimiter, apiLimiter, tooManyRequests }

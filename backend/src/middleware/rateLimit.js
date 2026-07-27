const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: () => Number(process.env.AUTH_RATELIMIT_MAX) || 10,
  skip: () => process.env.NODE_ENV === 'test' && process.env.AUTH_RATELIMIT_TEST !== '1',
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many attempts from this address. Please try again later.' })
  },
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: () => Number(process.env.API_RATELIMIT_MAX) || 100,
  skip: () => process.env.NODE_ENV === 'test' && process.env.API_RATELIMIT_TEST !== '1',
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests from this address. Please try again later.' })
  },
})

module.exports = { authLimiter, apiLimiter }

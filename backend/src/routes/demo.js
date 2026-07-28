const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { randomUUID } = require('crypto')
const rateLimit = require('express-rate-limit')
const User = require('../models/User')
const requireAuth = require('../middleware/auth')
const { requireDemo } = require('../middleware/demoGuards')
const { seedDemoUser, clearDemoUserData } = require('../services/demoData')
const { clearInsightsCache } = require('../services/insightsCache')

const router = express.Router()

const DEMO_TTL_MS = 24 * 60 * 60 * 1000

const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: () => Number(process.env.DEMO_RATELIMIT_MAX) || 5,
  skip: () => process.env.NODE_ENV === 'test' && process.env.DEMO_RATELIMIT_TEST !== '1',
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many demo sessions from this address. Please try again later.' })
  },
})

function issueDemoToken(userId) {
  return jwt.sign({ userId, isDemo: true }, process.env.JWT_SECRET, { expiresIn: '24h' })
}

async function sweepExpiredDemos() {
  const cutoff = new Date(Date.now() - DEMO_TTL_MS)
  const expired = await User.find({ isDemo: true, demoCreatedAt: { $lt: cutoff } }).select('_id')
  for (const user of expired) {
    try {
      await clearDemoUserData(user._id)
      await User.findByIdAndDelete(user._id)
    } catch {
    }
  }
}

router.post('/', demoLimiter, async (req, res) => {
  await sweepExpiredDemos()

  const passwordHash = await bcrypt.hash(randomUUID(), 10)
  const user = await User.create({
    email: `demo+${randomUUID()}@bread.local`,
    passwordHash,
    isDemo: true,
    demoCreatedAt: new Date(),
  })

  await seedDemoUser(user._id)

  res.json({ token: issueDemoToken(user._id) })
})

router.post('/reset', requireAuth, requireDemo, async (req, res) => {
  await clearDemoUserData(req.userId)
  await seedDemoUser(req.userId)
  await clearInsightsCache(req.userId)
  res.json({ ok: true })
})

router.delete('/', requireAuth, requireDemo, async (req, res) => {
  await clearDemoUserData(req.userId)
  await User.findByIdAndDelete(req.userId)
  res.json({ ok: true })
})

module.exports = router

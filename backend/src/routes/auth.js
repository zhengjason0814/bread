const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const requireAuth = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const wakeMl = require('../middleware/wakeMl')
const { isAdminEmail } = require('../services/adminAccess')
const { clearInsightsCache } = require('../services/insightsCache')

const router = express.Router()

const MAX_NAME_LENGTH = 40

function issueToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

router.post('/signup', authLimiter, wakeMl, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash })

  res.status(201).json({ token: issueToken(user) })
})

router.post('/login', authLimiter, wakeMl, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await User.findOne({ email })
  const valid = user && (await bcrypt.compare(password, user.passwordHash))
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  res.json({ token: issueToken(user) })
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select(
    'email name baseCurrency budgets createdAt isDemo'
  )
  if (!user) {
    return res.status(401).json({ error: 'Missing or invalid token' })
  }
  const userJSON = user.toJSON()
  userJSON.isAdmin = isAdminEmail(user.email)
  res.json({ user: userJSON })
})

router.patch('/me', requireAuth, async (req, res) => {
  const { baseCurrency, name } = req.body
  const updates = {}

  if (baseCurrency !== undefined) {
    if (!baseCurrency) {
      return res.status(400).json({ error: 'baseCurrency is required' })
    }
    updates.baseCurrency = baseCurrency
  }

  if (name !== undefined) {
    const trimmed = String(name).trim()
    if (trimmed.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` })
    }
    updates.name = trimmed
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, {
    returnDocument: 'after',
  }).select('email name baseCurrency budgets createdAt')

  if (updates.baseCurrency) {
    await clearInsightsCache(req.userId)
  }

  res.json({ user })
})

module.exports = router

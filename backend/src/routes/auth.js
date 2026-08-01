const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const googleClient = require('../config/google')
const requireAuth = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const wakeMl = require('../middleware/wakeMl')
const { isAdminEmail } = require('../services/adminAccess')
const { clearInsightsCache } = require('../services/insightsCache')
const { convertAmount } = require('../services/exchangeRates')

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
  const valid = user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  res.json({ token: issueToken(user) })
})

router.post('/google', authLimiter, wakeMl, async (req, res) => {
  const { credential } = req.body
  if (!credential) {
    return res.status(400).json({ error: 'A Google credential is required' })
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'Google sign-in is not configured' })
  }

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    payload = ticket.getPayload()
  } catch {
    return res.status(401).json({ error: 'Could not verify that Google account' })
  }

  if (!payload?.email || !payload.email_verified) {
    return res.status(401).json({ error: 'That Google account has no verified email address' })
  }

  const email = payload.email.toLowerCase()
  const googleId = payload.sub
  const googleName = (payload.name || '').trim().slice(0, MAX_NAME_LENGTH)

  let user = (await User.findOne({ googleId })) || (await User.findOne({ email }))

  if (user) {
    const updates = {}
    if (!user.googleId) updates.googleId = googleId
    if (!user.name && googleName) updates.name = googleName
    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(user._id, updates, { returnDocument: 'after' })
    }
  } else {
    user = await User.create({ email, googleId, name: googleName })
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

  if (baseCurrency === undefined && name === undefined) {
    return res.status(400).json({ error: 'Nothing to update' })
  }
  if (baseCurrency !== undefined && !baseCurrency) {
    return res.status(400).json({ error: 'baseCurrency is required' })
  }
  let trimmedName
  if (name !== undefined) {
    trimmedName = String(name).trim()
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` })
    }
  }

  const user = await User.findById(req.userId).select('email name baseCurrency budgets createdAt')
  const baseCurrencyChanged = baseCurrency !== undefined && baseCurrency !== user.baseCurrency

  if (baseCurrencyChanged && user.budgets.size > 0) {
    const today = new Date().toISOString().slice(0, 10)
    for (const [category, amount] of user.budgets) {
      const converted = await convertAmount(amount, user.baseCurrency, baseCurrency, today)
      if (converted !== null) user.budgets.set(category, converted)
    }
  }

  if (baseCurrency !== undefined) user.baseCurrency = baseCurrency
  if (name !== undefined) user.name = trimmedName
  await user.save()

  if (baseCurrencyChanged) {
    await clearInsightsCache(req.userId)
  }

  res.json({ user })
})

module.exports = router

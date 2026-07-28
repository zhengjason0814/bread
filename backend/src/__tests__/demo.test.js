const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const User = require('../models/User')
const cache = require('../services/cache')
const { insightsKey } = require('../services/insightsCache')

function authed(req, token) {
  return req.set('Authorization', `Bearer ${token}`)
}

function tokenFor(userId, extra = {}) {
  return jwt.sign({ userId, ...extra }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

describe('GET /api/auth/me isDemo flag', () => {
  it('is true for a demo user and false for a normal user', async () => {
    const demo = await User.create({ email: 'demo1@bread.local', passwordHash: 'x', isDemo: true })
    const normal = await User.create({ email: 'real@example.com', passwordHash: 'x' })

    const demoMe = await authed(request(app).get('/api/auth/me'), tokenFor(demo._id, { isDemo: true }))
    const normalMe = await authed(request(app).get('/api/auth/me'), tokenFor(normal._id))

    expect(demoMe.body.user.isDemo).toBe(true)
    expect(normalMe.body.user.isDemo).toBe(false)
  })
})

const { seedDemoUser, clearDemoUserData, DEMO_EXPENSE_COUNT } = require('../services/demoData')
const Expense = require('../models/Expense')
const Account = require('../models/Account')
const PlaidItem = require('../models/PlaidItem')

describe('demoData seed/clear', () => {
  it('seeds a lifelike dataset for a user', async () => {
    const user = await User.create({ email: 'seed@bread.local', passwordHash: 'x', isDemo: true })
    await seedDemoUser(user._id)

    const expenses = await Expense.find({ user: user._id })
    const accounts = await Account.find({ user: user._id })
    const items = await PlaidItem.find({ user: user._id })
    const reloaded = await User.findById(user._id)

    expect(expenses).toHaveLength(DEMO_EXPENSE_COUNT)
    expect(accounts.length).toBeGreaterThanOrEqual(2)
    expect(accounts.some((a) => a.type === 'depository')).toBe(true)
    expect(accounts.some((a) => a.type === 'credit')).toBe(true)
    expect(items).toHaveLength(1)
    expect(reloaded.budgets.size).toBeGreaterThanOrEqual(1)

    const incomes = expenses.filter((e) => e.type === 'income')
    expect(incomes.length).toBeGreaterThanOrEqual(3)
    const netflix = expenses.filter((e) => e.note === 'Netflix')
    expect(netflix.length).toBeGreaterThanOrEqual(3)
    const months = new Set(expenses.map((e) => e.date.toISOString().slice(0, 7)))
    expect(months.size).toBeGreaterThanOrEqual(4)
  })

  it('clears all of a demo user\'s data', async () => {
    const user = await User.create({ email: 'clear@bread.local', passwordHash: 'x', isDemo: true })
    await seedDemoUser(user._id)
    await clearDemoUserData(user._id)

    expect(await Expense.countDocuments({ user: user._id })).toBe(0)
    expect(await Account.countDocuments({ user: user._id })).toBe(0)
    expect(await PlaidItem.countDocuments({ user: user._id })).toBe(0)
    const reloaded = await User.findById(user._id)
    expect(reloaded.budgets.size).toBe(0)
  })
})

describe('POST /api/demo', () => {
  it('creates a seeded demo user and returns a working demo token', async () => {
    const response = await request(app).post('/api/demo')
    expect(response.status).toBe(200)
    expect(response.body.token).toBeTruthy()

    const me = await authed(request(app).get('/api/auth/me'), response.body.token)
    expect(me.status).toBe(200)
    expect(me.body.user.isDemo).toBe(true)

    const created = await User.findById(me.body.user._id ?? (await User.findOne({ email: me.body.user.email }))._id)
    expect(await Expense.countDocuments({ user: created._id })).toBeGreaterThan(0)
  })

  it('sweeps demo users older than the TTL but leaves real and fresh ones', async () => {
    const old = await User.create({
      email: `demo-old-${Date.now()}@bread.local`,
      passwordHash: 'x',
      isDemo: true,
      demoCreatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    })
    await seedDemoUser(old._id)
    const real = await User.create({ email: 'keep@example.com', passwordHash: 'x' })
    const fresh = await User.create({
      email: `demo-fresh-${Date.now()}@bread.local`,
      passwordHash: 'x',
      isDemo: true,
      demoCreatedAt: new Date(),
    })

    await request(app).post('/api/demo')

    expect(await User.findById(old._id)).toBeNull()
    expect(await Expense.countDocuments({ user: old._id })).toBe(0)
    expect(await User.findById(real._id)).not.toBeNull()
    expect(await User.findById(fresh._id)).not.toBeNull()
  })
})

describe('demo-only routes', () => {
  async function startDemo() {
    const res = await request(app).post('/api/demo')
    const me = await authed(request(app).get('/api/auth/me'), res.body.token)
    const user = await User.findOne({ email: me.body.user.email })
    return { token: res.body.token, userId: user._id }
  }

  it('reset wipes mutations and restores the seeded data', async () => {
    const { token, userId } = await startDemo()
    await Expense.deleteMany({ user: userId })
    expect(await Expense.countDocuments({ user: userId })).toBe(0)

    const reset = await authed(request(app).post('/api/demo/reset'), token)
    expect(reset.status).toBe(200)
    expect(await Expense.countDocuments({ user: userId })).toBeGreaterThan(0)
  })

  it('reset clears the demo user\'s cached ML insights', async () => {
    const { token, userId } = await startDemo()
    await cache.setJson(insightsKey(userId, 'prediction'), { status: 'ok' }, 600)
    expect(await cache.getJson(insightsKey(userId, 'prediction'))).not.toBeNull()

    const reset = await authed(request(app).post('/api/demo/reset'), token)
    expect(reset.status).toBe(200)

    expect(await cache.getJson(insightsKey(userId, 'prediction'))).toBeNull()
  })

  it('delete removes the demo user and its data', async () => {
    const { token, userId } = await startDemo()
    const del = await authed(request(app).delete('/api/demo'), token)
    expect(del.status).toBe(200)
    expect(await User.findById(userId)).toBeNull()
    expect(await Expense.countDocuments({ user: userId })).toBe(0)
  })

  it('rejects reset/delete for a non-demo token with 403', async () => {
    const real = await User.create({ email: 'realuser@example.com', passwordHash: 'x' })
    const realToken = tokenFor(real._id)
    expect((await authed(request(app).post('/api/demo/reset'), realToken)).status).toBe(403)
    expect((await authed(request(app).delete('/api/demo'), realToken)).status).toBe(403)
  })
})

describe('demo rate limiting', () => {
  const prev = { flag: process.env.DEMO_RATELIMIT_TEST, max: process.env.DEMO_RATELIMIT_MAX }
  beforeEach(() => {
    process.env.DEMO_RATELIMIT_TEST = '1'
    process.env.DEMO_RATELIMIT_MAX = '2'
  })
  afterEach(() => {
    process.env.DEMO_RATELIMIT_TEST = prev.flag
    process.env.DEMO_RATELIMIT_MAX = prev.max
  })

  it('returns 429 once the per-window limit is exceeded', async () => {
    const a = await request(app).post('/api/demo')
    const b = await request(app).post('/api/demo')
    const c = await request(app).post('/api/demo')
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(c.status).toBe(429)
  })
})

describe('demo tokens are blocked from paid/abuse features', () => {
  async function demoToken() {
    const res = await request(app).post('/api/demo')
    return res.body.token
  }

  it('403s a demo token on Plaid exchange and sync', async () => {
    const token = await demoToken()
    const exchange = await authed(request(app).post('/api/plaid/exchange'), token).send({ public_token: 'x' })
    const sync = await authed(request(app).post('/api/plaid/sync'), token)
    expect(exchange.status).toBe(403)
    expect(sync.status).toBe(403)
  })

  it('403s a demo token on receipt upload', async () => {
    const token = await demoToken()
    const created = await authed(request(app).post('/api/expenses'), token).send({
      amount: 5, currency: 'USD', category: 'Dining', date: '2026-07-01', note: 'x', type: 'expense',
    })
    const id = created.body.expense._id
    const upload = await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt', Buffer.from('x'), { filename: 'x.jpg', contentType: 'image/jpeg' }
    )
    expect(upload.status).toBe(403)
  })
})

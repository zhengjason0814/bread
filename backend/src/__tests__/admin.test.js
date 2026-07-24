const request = require('supertest')
const app = require('../app')
const { isAdminEmail } = require('../services/adminAccess')
const User = require('../models/User')

async function signupAndGetToken(email) {
  const response = await request(app).post('/api/auth/signup').send({ email, password: 'password123' })
  return response.body.token
}

function authed(req, token) {
  return req.set('Authorization', `Bearer ${token}`)
}

describe('adminAccess.isAdminEmail', () => {
  const original = process.env.ADMIN_EMAILS
  afterEach(() => {
    process.env.ADMIN_EMAILS = original
  })

  it('matches an allowlisted email case-insensitively and trimmed', () => {
    process.env.ADMIN_EMAILS = ' Boss@Example.com , second@example.com '
    expect(isAdminEmail('boss@example.com')).toBe(true)
    expect(isAdminEmail('SECOND@example.com')).toBe(true)
  })

  it('rejects non-listed, empty, and undefined emails', () => {
    process.env.ADMIN_EMAILS = 'boss@example.com'
    expect(isAdminEmail('nobody@example.com')).toBe(false)
    expect(isAdminEmail('')).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
  })

  it('treats an unset allowlist as nobody', () => {
    delete process.env.ADMIN_EMAILS
    expect(isAdminEmail('boss@example.com')).toBe(false)
  })
})

describe('GET /api/auth/me isAdmin flag', () => {
  const original = process.env.ADMIN_EMAILS
  afterEach(() => {
    process.env.ADMIN_EMAILS = original
  })

  it('is true for an allowlisted user and false otherwise', async () => {
    process.env.ADMIN_EMAILS = 'boss@example.com'
    const adminToken = await signupAndGetToken('boss@example.com')
    const userToken = await signupAndGetToken('user@example.com')

    const adminMe = await authed(request(app).get('/api/auth/me'), adminToken)
    const userMe = await authed(request(app).get('/api/auth/me'), userToken)

    expect(adminMe.body.user.isAdmin).toBe(true)
    expect(userMe.body.user.isAdmin).toBe(false)
  })

  it('returns 401 when the token references a user that no longer exists', async () => {
    const token = await signupAndGetToken('ghost@example.com')
    const deletedUser = await User.findOne({ email: 'ghost@example.com' })
    await User.deleteOne({ _id: deletedUser._id })

    const response = await authed(request(app).get('/api/auth/me'), token)

    expect(response.status).toBe(401)
  })
})

describe('GET /api/admin/stats', () => {
  const original = process.env.ADMIN_EMAILS
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'boss@example.com'
    global.fetch = jest.fn(async (url) => ({
      ok: true,
      json: async () => ({ base: 'USD', date: '2026-07-01', rates: { EUR: 0.5 } }),
    }))
  })
  afterEach(() => {
    process.env.ADMIN_EMAILS = original
    jest.restoreAllMocks()
  })

  async function addExpense(token, body) {
    return authed(request(app).post('/api/expenses'), token).send(body)
  }

  it('rejects a non-admin with 403 and no token with 401', async () => {
    const userToken = await signupAndGetToken('user@example.com')
    const forbidden = await authed(request(app).get('/api/admin/stats'), userToken)
    const unauthorized = await request(app).get('/api/admin/stats')
    expect(forbidden.status).toBe(403)
    expect(unauthorized.status).toBe(401)
  })

  it('returns totals and per-user rows sorted by spend desc', async () => {
    const adminToken = await signupAndGetToken('boss@example.com')
    const userToken = await signupAndGetToken('user@example.com')

    await addExpense(adminToken, { amount: 100, currency: 'USD', category: 'Groceries', date: '2026-07-01', note: 'a', type: 'expense' })
    await addExpense(userToken, { amount: 10, currency: 'USD', category: 'Dining', date: '2026-07-01', note: 'b', type: 'expense' })
    await addExpense(userToken, { amount: 5, currency: 'USD', category: 'Dining', date: '2026-07-01', note: 'c', type: 'expense' })

    const response = await authed(request(app).get('/api/admin/stats'), adminToken)

    expect(response.status).toBe(200)
    expect(response.body.baseCurrency).toBe('USD')
    expect(response.body.totals.userCount).toBe(2)
    expect(response.body.totals.expenseCount).toBe(3)
    expect(response.body.totals.totalSpend).toBe(115)
    expect(response.body.users).toHaveLength(2)
    expect(response.body.users[0].email).toBe('boss@example.com')
    expect(response.body.users[0].totalSpend).toBe(100)
    expect(response.body.users[1].expenseCount).toBe(2)
  })

  it('excludes income and Credit Card Payment from spend but counts them as expenses, and sums multi-currency into USD', async () => {
    const adminToken = await signupAndGetToken('boss@example.com')
    await addExpense(adminToken, { amount: 100, currency: 'EUR', category: 'Groceries', date: '2026-07-01', note: 'eur', type: 'expense' })
    await addExpense(adminToken, { amount: 500, currency: 'USD', category: 'Income', date: '2026-07-01', note: 'pay', type: 'income' })
    await addExpense(adminToken, { amount: 50, currency: 'USD', category: 'Credit Card Payment', date: '2026-07-01', note: 'ccp', type: 'expense' })

    const response = await authed(request(app).get('/api/admin/stats'), adminToken)

    expect(response.body.totals.expenseCount).toBe(3)
    expect(response.body.totals.totalSpend).toBe(200)
    expect(response.body.users[0].totalSpend).toBe(200)
  })

  it('drops a spend row in a currency with no rate from totalSpend but still counts it as an expense', async () => {
    const adminToken = await signupAndGetToken('boss@example.com')
    await addExpense(adminToken, { amount: 100, currency: 'GBP', category: 'Groceries', date: '2026-07-01', note: 'gbp', type: 'expense' })
    await addExpense(adminToken, { amount: 40, currency: 'USD', category: 'Dining', date: '2026-07-01', note: 'usd', type: 'expense' })

    const response = await authed(request(app).get('/api/admin/stats'), adminToken)

    expect(response.body.totals.expenseCount).toBe(2)
    expect(response.body.totals.totalSpend).toBe(40)
    expect(response.body.users[0].totalSpend).toBe(40)
  })
})

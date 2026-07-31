const request = require('supertest')
const app = require('../app')

jest.mock('../services/mlClient')

const mlClient = require('../services/mlClient')

async function signupAndGetToken(email = 'a@b.com') {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email, password: 'hunter22' })
  return res.body.token
}

async function createExpense(token, overrides = {}) {
  const res = await request(app)
    .post('/api/expenses')
    .set('Authorization', `Bearer ${token}`)
    .send({
      amount: 5,
      category: 'Dining',
      date: '2026-07-01',
      note: 'test note',
      type: 'expense',
      ...overrides,
    })
  return res.body.expense
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/expenses/:id/dismiss-anomaly', () => {
  it('sets anomalyDismissed on own expense', async () => {
    const token = await signupAndGetToken()
    const expense = await createExpense(token)
    const res = await request(app)
      .post(`/api/expenses/${expense._id}/dismiss-anomaly`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.expense.anomalyDismissed).toBe(true)
  })

  it('404s on another user\'s expense', async () => {
    const ownerToken = await signupAndGetToken('owner@b.com')
    const expense = await createExpense(ownerToken)
    const strangerToken = await signupAndGetToken('stranger@b.com')
    const res = await request(app)
      .post(`/api/expenses/${expense._id}/dismiss-anomaly`)
      .set('Authorization', `Bearer ${strangerToken}`)
    expect(res.status).toBe(404)
  })

  it('401s without a token', async () => {
    const res = await request(app).post('/api/expenses/123/dismiss-anomaly')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/expenses/dismiss-anomalies', () => {
  it('sets anomalyDismissed on multiple own expenses in one call', async () => {
    const token = await signupAndGetToken()
    const first = await createExpense(token)
    const second = await createExpense(token)

    const res = await request(app)
      .post('/api/expenses/dismiss-anomalies')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [first._id, second._id] })

    expect(res.status).toBe(200)
    expect(res.body.dismissed).toBe(2)

    const list = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
    const byId = Object.fromEntries(list.body.expenses.map((e) => [e._id, e]))
    expect(byId[first._id].anomalyDismissed).toBe(true)
    expect(byId[second._id].anomalyDismissed).toBe(true)
  })

  it('only dismisses ids owned by the requesting user', async () => {
    const ownerToken = await signupAndGetToken('owner@b.com')
    const ownerExpense = await createExpense(ownerToken)
    const strangerToken = await signupAndGetToken('stranger@b.com')
    const strangerExpense = await createExpense(strangerToken)

    const res = await request(app)
      .post('/api/expenses/dismiss-anomalies')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ ids: [ownerExpense._id, strangerExpense._id] })

    expect(res.status).toBe(200)
    expect(res.body.dismissed).toBe(1)

    const strangerList = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${strangerToken}`)
    expect(strangerList.body.expenses[0].anomalyDismissed).toBe(false)
  })

  it('400s when ids is missing or empty', async () => {
    const token = await signupAndGetToken()

    const missing = await request(app)
      .post('/api/expenses/dismiss-anomalies')
      .set('Authorization', `Bearer ${token}`)
      .send({})
    expect(missing.status).toBe(400)

    const empty = await request(app)
      .post('/api/expenses/dismiss-anomalies')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [] })
    expect(empty.status).toBe(400)
  })

  it('401s without a token', async () => {
    const res = await request(app)
      .post('/api/expenses/dismiss-anomalies')
      .send({ ids: ['123'] })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/insights/prediction', () => {
  it('relays ML result and adds baseCurrency', async () => {
    mlClient.predict.mockResolvedValue({
      status: 'ok',
      current_month: { low: 100, mid: 150, high: 200, spent_so_far: 50 },
      next_month: { low: 90, mid: 140, high: 210 },
    })
    const token = await signupAndGetToken()
    await createExpense(token)
    const res = await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.baseCurrency).toBe('USD')
    expect(mlClient.predict).toHaveBeenCalledWith(
      [{ date: '2026-07-01', amount: 5 }],
      expect.any(String)
    )
  })

  it('excludes income and Credit Card Payment from the ML input', async () => {
    mlClient.predict.mockResolvedValue({
      status: 'ok',
      current_month: { low: 100, mid: 150, high: 200, spent_so_far: 50 },
      next_month: { low: 90, mid: 140, high: 210 },
    })
    const token = await signupAndGetToken()
    await createExpense(token, { amount: 5, category: 'Dining', date: '2026-07-01' })
    await createExpense(token, {
      amount: 2000,
      category: 'Income',
      date: '2026-07-02',
      type: 'income',
    })
    await createExpense(token, { amount: 300, category: 'Credit Card Payment', date: '2026-07-03' })

    await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)

    expect(mlClient.predict).toHaveBeenCalledWith(
      [{ date: '2026-07-01', amount: 5 }],
      expect.any(String)
    )
  })

  it('degrades to unavailable when ML service is down', async () => {
    mlClient.predict.mockRejectedValue(new Error('connect ECONNREFUSED'))
    const token = await signupAndGetToken()
    const res = await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('unavailable')
  })

  it('401s without a token', async () => {
    const res = await request(app).get('/api/insights/prediction')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/insights/anomalies', () => {
  it('filters out dismissed anomalies', async () => {
    const token = await signupAndGetToken()
    const kept = await createExpense(token, { amount: 95 })
    const dismissed = await createExpense(token, { amount: 90 })
    await request(app)
      .post(`/api/expenses/${dismissed._id}/dismiss-anomaly`)
      .set('Authorization', `Bearer ${token}`)
    mlClient.detectAnomalies.mockResolvedValue({
      status: 'ok',
      anomalies: [
        { id: String(kept._id), category: 'Coffee', amount: 95, score: 6, typical_low: 4, typical_high: 7 },
        { id: String(dismissed._id), category: 'Coffee', amount: 90, score: 5, typical_low: 4, typical_high: 7 },
      ],
    })
    const res = await request(app)
      .get('/api/insights/anomalies')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.anomalies.map((a) => a.id)).toEqual([String(kept._id)])
  })

  it('degrades to unavailable with empty anomalies', async () => {
    mlClient.detectAnomalies.mockRejectedValue(new Error('down'))
    const token = await signupAndGetToken()
    const res = await request(app)
      .get('/api/insights/anomalies')
      .set('Authorization', `Bearer ${token}`)
    expect(res.body).toMatchObject({ status: 'unavailable', anomalies: [] })
  })

  it('excludes income and Credit Card Payment from the ML input', async () => {
    mlClient.detectAnomalies.mockResolvedValue({ status: 'ok', anomalies: [] })
    const token = await signupAndGetToken()
    const kept = await createExpense(token, { amount: 5, category: 'Dining', date: '2026-07-01' })
    await createExpense(token, {
      amount: 2000,
      category: 'Income',
      date: '2026-07-02',
      type: 'income',
    })
    await createExpense(token, { amount: 300, category: 'Credit Card Payment', date: '2026-07-03' })

    await request(app)
      .get('/api/insights/anomalies')
      .set('Authorization', `Bearer ${token}`)

    expect(mlClient.detectAnomalies).toHaveBeenCalledWith([
      { id: String(kept._id), category: 'Dining', amount: 5, date: '2026-07-01' },
    ])
  })

  it('excludes Other-category expenses from the ML input', async () => {
    mlClient.detectAnomalies.mockResolvedValue({ status: 'ok', anomalies: [] })
    const token = await signupAndGetToken()
    const kept = await createExpense(token, { amount: 5, category: 'Dining', date: '2026-07-01' })
    await createExpense(token, { amount: 999, category: 'Other', date: '2026-07-02' })

    await request(app)
      .get('/api/insights/anomalies')
      .set('Authorization', `Bearer ${token}`)

    expect(mlClient.detectAnomalies).toHaveBeenCalledWith([
      { id: String(kept._id), category: 'Dining', amount: 5, date: '2026-07-01' },
    ])
  })
})

describe('GET /api/insights/suggest-category', () => {
  it('400s on missing text', async () => {
    const token = await signupAndGetToken()
    const res = await request(app)
      .get('/api/insights/suggest-category')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })

  it('relays the suggestion for the given text', async () => {
    mlClient.classify.mockResolvedValue({ status: 'ok', category: 'Groceries', confidence: 0.83 })
    const token = await signupAndGetToken()
    const res = await request(app)
      .get('/api/insights/suggest-category?text=whole+foods')
      .set('Authorization', `Bearer ${token}`)
    expect(res.body).toMatchObject({ status: 'ok', category: 'Groceries' })
    expect(mlClient.classify).toHaveBeenCalledWith('whole foods')
  })
})

describe('insight caching', () => {
  test('prediction is a MISS then a HIT', async () => {
    mlClient.predict.mockResolvedValue({
      status: 'ok',
      current_month: { low: 100, mid: 150, high: 200, spent_so_far: 50 },
      next_month: { low: 90, mid: 140, high: 210 },
    })
    const token = await signupAndGetToken()

    const first = await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    expect(first.status).toBe(200)
    expect(first.headers['x-cache']).toBe('MISS')

    const second = await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    expect(second.status).toBe(200)
    expect(second.headers['x-cache']).toBe('HIT')
    expect(second.body).toEqual(first.body)
  })

  test('adding an expense busts the prediction cache', async () => {
    mlClient.predict.mockResolvedValue({
      status: 'ok',
      current_month: { low: 100, mid: 150, high: 200, spent_so_far: 50 },
      next_month: { low: 90, mid: 140, high: 210 },
    })
    const token = await signupAndGetToken()

    await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    const hit = await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    expect(hit.headers['x-cache']).toBe('HIT')

    await createExpense(token)

    const afterChange = await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    expect(afterChange.headers['x-cache']).toBe('MISS')
  })

  test('changing base currency busts the prediction cache', async () => {
    mlClient.predict.mockResolvedValue({
      status: 'ok',
      current_month: { low: 100, mid: 150, high: 200, spent_so_far: 50 },
      next_month: { low: 90, mid: 140, high: 210 },
    })
    const token = await signupAndGetToken()

    await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    const hit = await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    expect(hit.headers['x-cache']).toBe('HIT')

    await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ baseCurrency: 'EUR' })

    const afterChange = await request(app)
      .get('/api/insights/prediction')
      .set('Authorization', `Bearer ${token}`)
    expect(afterChange.headers['x-cache']).toBe('MISS')
  })
})

describe('GET /api/insights/recurring', () => {
  it('relays series and adds baseCurrency', async () => {
    mlClient.detectRecurring.mockResolvedValue({
      status: 'ok',
      series: [{ name: 'Netflix', cadence: 'monthly', typical_amount: 15.49 }],
    })
    const token = await signupAndGetToken()
    const res = await request(app)
      .get('/api/insights/recurring')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'ok', baseCurrency: 'USD' })
    expect(res.body.series).toHaveLength(1)
  })

  it('sends merchant-preferred text and excludes non-spend rows', async () => {
    mlClient.detectRecurring.mockResolvedValue({ status: 'insufficient_data' })
    const token = await signupAndGetToken()
    const kept = await createExpense(token, { note: 'monthly sub', amount: 10, date: '2026-07-01' })
    await createExpense(token, {
      amount: 2000,
      category: 'Income',
      date: '2026-07-02',
      type: 'income',
    })
    await createExpense(token, { amount: 300, category: 'Credit Card Payment', date: '2026-07-03' })

    await request(app)
      .get('/api/insights/recurring')
      .set('Authorization', `Bearer ${token}`)

    expect(mlClient.detectRecurring).toHaveBeenCalledWith([
      { id: String(kept._id), text: 'monthly sub', amount: 10, date: '2026-07-01' },
    ])
  })

  it('degrades to unavailable when ML service is down', async () => {
    mlClient.detectRecurring.mockRejectedValue(new Error('down'))
    const token = await signupAndGetToken()
    const res = await request(app)
      .get('/api/insights/recurring')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'unavailable', baseCurrency: 'USD' })
  })

  it('401s without a token', async () => {
    const res = await request(app).get('/api/insights/recurring')
    expect(res.status).toBe(401)
  })
})

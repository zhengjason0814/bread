const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Expense = require('../models/Expense')

function tokenFor(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

describe('app hardening', () => {
  test('health reports an instance string', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(typeof res.body.instance).toBe('string')
    expect(res.body.instance.length).toBeGreaterThan(0)
  })

  test('trust proxy is enabled', () => {
    expect(app.get('trust proxy')).toBe(1)
  })

  test('unhandled route error returns clean JSON 500, not an HTML stack trace', async () => {
    const spy = jest.spyOn(Expense, 'find').mockImplementation(() => {
      throw new Error('boom')
    })
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${tokenFor('507f1f77bcf86cd799439011')}`)
    expect(res.status).toBe(500)
    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body).toEqual({ error: 'Internal server error' })
    expect(res.text).not.toMatch(/at .*\.js:/)
    spy.mockRestore()
  })
})

const request = require('supertest')
const app = require('../app')

describe('rate limiting', () => {
  test('auth limiter returns 429 after the limit', async () => {
    process.env.AUTH_RATELIMIT_TEST = '1'
    process.env.AUTH_RATELIMIT_MAX = '3'
    let last
    for (let i = 0; i < 4; i += 1) {
      last = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrong' })
    }
    expect(last.status).toBe(429)
    expect(last.body.error).toMatch(/sign-in attempts/)
    expect(last.body.retryAfter).toBeGreaterThan(0)
    expect(last.headers['retry-after']).toBe(String(last.body.retryAfter))
    delete process.env.AUTH_RATELIMIT_TEST
    delete process.env.AUTH_RATELIMIT_MAX
  })

  test('api limiter returns 429 after the limit', async () => {
    process.env.API_RATELIMIT_TEST = '1'
    process.env.API_RATELIMIT_MAX = '3'
    let last
    for (let i = 0; i < 4; i += 1) {
      last = await request(app).get('/api/health')
    }
    expect(last.status).toBe(429)
    expect(last.body.error).toMatch(/oven needs a minute/)
    expect(last.body.retryAfter).toBeGreaterThan(0)
    expect(last.body.retryAfter).toBeLessThanOrEqual(60)
    delete process.env.API_RATELIMIT_TEST
    delete process.env.API_RATELIMIT_MAX
  })

  test('limiters are skipped by default under test', async () => {
    let last
    for (let i = 0; i < 6; i += 1) {
      last = await request(app).get('/api/health')
    }
    expect(last.status).toBe(200)
  })
})

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

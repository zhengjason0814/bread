process.env.FRONTEND_ORIGIN = 'https://bread.example.com,https://preview.example.com'

const request = require('supertest')
const app = require('../app')

describe('cors when FRONTEND_ORIGIN is set', () => {
  test('allows a configured origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://bread.example.com')
    expect(res.headers['access-control-allow-origin']).toBe('https://bread.example.com')
  })

  test('allows a second configured origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://preview.example.com')
    expect(res.headers['access-control-allow-origin']).toBe('https://preview.example.com')
  })

  test('does not allow an unlisted origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://evil.example.com')
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  test('answers preflight with the Authorization header allowed', async () => {
    const res = await request(app)
      .options('/api/expenses')
      .set('Origin', 'https://bread.example.com')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
    expect(res.status).toBe(204)
    expect(res.headers['access-control-allow-origin']).toBe('https://bread.example.com')
    expect(res.headers['access-control-allow-headers']).toMatch(/authorization/i)
  })
})

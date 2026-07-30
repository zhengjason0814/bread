const request = require('supertest')
const app = require('../app')

const credentials = { email: 'baker@example.com', password: 'password123' }

async function signUp() {
  const response = await request(app).post('/api/auth/signup').send(credentials)
  return response.body.token
}

function authed(req, token) {
  return req.set('Authorization', `Bearer ${token}`)
}

describe('display name', () => {
  it('is empty until the user sets one', async () => {
    const token = await signUp()
    const response = await authed(request(app).get('/api/auth/me'), token)

    expect(response.status).toBe(200)
    expect(response.body.user.name ?? '').toBe('')
  })

  it('saves a name through PATCH /me', async () => {
    const token = await signUp()
    const response = await authed(request(app).patch('/api/auth/me'), token).send({ name: 'Jason' })

    expect(response.status).toBe(200)
    expect(response.body.user.name).toBe('Jason')

    const me = await authed(request(app).get('/api/auth/me'), token)
    expect(me.body.user.name).toBe('Jason')
  })

  it('trims surrounding whitespace', async () => {
    const token = await signUp()
    const response = await authed(request(app).patch('/api/auth/me'), token).send({
      name: '   Jason   ',
    })

    expect(response.body.user.name).toBe('Jason')
  })

  it('clears the name when given an empty string', async () => {
    const token = await signUp()
    await authed(request(app).patch('/api/auth/me'), token).send({ name: 'Jason' })
    const response = await authed(request(app).patch('/api/auth/me'), token).send({ name: '  ' })

    expect(response.status).toBe(200)
    expect(response.body.user.name).toBe('')
  })

  it('rejects a name that is too long', async () => {
    const token = await signUp()
    const response = await authed(request(app).patch('/api/auth/me'), token).send({
      name: 'a'.repeat(41),
    })

    expect(response.status).toBe(400)
  })

  it('updates the name without disturbing the base currency', async () => {
    const token = await signUp()
    await authed(request(app).patch('/api/auth/me'), token).send({ baseCurrency: 'EUR' })
    const response = await authed(request(app).patch('/api/auth/me'), token).send({ name: 'Jason' })

    expect(response.body.user.baseCurrency).toBe('EUR')
    expect(response.body.user.name).toBe('Jason')
  })

  it('still updates the base currency on its own', async () => {
    const token = await signUp()
    const response = await authed(request(app).patch('/api/auth/me'), token).send({
      baseCurrency: 'GBP',
    })

    expect(response.status).toBe(200)
    expect(response.body.user.baseCurrency).toBe('GBP')
  })

  it('rejects a request that changes nothing', async () => {
    const token = await signUp()
    const response = await authed(request(app).patch('/api/auth/me'), token).send({})

    expect(response.status).toBe(400)
  })
})

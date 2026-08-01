const request = require('supertest')

jest.mock('../config/google', () => ({ verifyIdToken: jest.fn() }))

const googleClient = require('../config/google')
const User = require('../models/User')
const app = require('../app')

function mockGoogleAccount({
  sub = 'google-sub-123',
  email = 'jane@example.com',
  emailVerified = true,
  name = 'Jane Doe',
} = {}) {
  googleClient.verifyIdToken.mockResolvedValue({
    getPayload: () => ({ sub, email, email_verified: emailVerified, name }),
  })
}

function signInWithGoogle(credential = 'google-id-token') {
  return request(app).post('/api/auth/google').send({ credential })
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com'
})

describe('POST /api/auth/google', () => {
  it('creates an account on first Google sign-in and returns a token', async () => {
    mockGoogleAccount()

    const response = await signInWithGoogle()

    expect(response.status).toBe(200)
    expect(response.body.token).toEqual(expect.any(String))

    const user = await User.findOne({ email: 'jane@example.com' })
    expect(user.googleId).toBe('google-sub-123')
    expect(user.passwordHash).toBeFalsy()
  })

  it('verifies the token against our own client id', async () => {
    mockGoogleAccount()

    await signInWithGoogle('a-specific-token')

    expect(googleClient.verifyIdToken).toHaveBeenCalledWith({
      idToken: 'a-specific-token',
      audience: 'test-client-id.apps.googleusercontent.com',
    })
  })

  it('signs a returning Google user into the same account', async () => {
    mockGoogleAccount()
    await signInWithGoogle()
    mockGoogleAccount()
    await signInWithGoogle()

    expect(await User.countDocuments({ email: 'jane@example.com' })).toBe(1)
  })

  it('links to an existing password account with the same email, keeping its data', async () => {
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'jane@example.com', password: 'password123' })
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${signup.body.token}`)
      .send({
        amount: 12.5,
        category: 'Dining',
        date: '2026-07-10',
        note: 'Lunch',
        type: 'expense',
      })

    mockGoogleAccount()
    const response = await signInWithGoogle()

    expect(response.status).toBe(200)
    expect(await User.countDocuments({ email: 'jane@example.com' })).toBe(1)

    const expenses = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${response.body.token}`)
    expect(expenses.body.expenses).toHaveLength(1)
    expect(expenses.body.expenses[0].note).toBe('Lunch')
  })

  it('refuses to link when Google says the email is unverified', async () => {
    mockGoogleAccount({ emailVerified: false })

    const response = await signInWithGoogle()

    expect(response.status).toBe(401)
    expect(await User.countDocuments()).toBe(0)
  })

  it('adopts the Google display name for a new account', async () => {
    mockGoogleAccount({ name: 'Jane Doe' })

    await signInWithGoogle()

    const user = await User.findOne({ email: 'jane@example.com' })
    expect(user.name).toBe('Jane Doe')
  })

  it('does not overwrite a name the user has already chosen', async () => {
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'jane@example.com', password: 'password123' })
    await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${signup.body.token}`)
      .send({ name: 'Janey' })

    mockGoogleAccount({ name: 'Jane Doe' })
    await signInWithGoogle()

    const user = await User.findOne({ email: 'jane@example.com' })
    expect(user.name).toBe('Janey')
  })

  it('400s when no credential is supplied', async () => {
    const response = await request(app).post('/api/auth/google').send({})

    expect(response.status).toBe(400)
  })

  it('401s when Google rejects the token', async () => {
    googleClient.verifyIdToken.mockRejectedValue(new Error('Invalid token signature'))

    const response = await signInWithGoogle('forged-token')

    expect(response.status).toBe(401)
  })

  it('503s when the server has no Google client id configured', async () => {
    delete process.env.GOOGLE_CLIENT_ID
    mockGoogleAccount()

    const response = await signInWithGoogle()

    expect(response.status).toBe(503)
  })
})

describe('password login for a Google-only account', () => {
  it('401s rather than crashing when the account has no password', async () => {
    mockGoogleAccount()
    await signInWithGoogle()

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'password123' })

    expect(response.status).toBe(401)
    expect(response.body.error).toBe('Invalid credentials')
  })
})

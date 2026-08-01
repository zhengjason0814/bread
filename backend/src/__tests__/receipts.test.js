const request = require('supertest')

jest.mock('../services/receiptStorage')
const receiptStorage = require('../services/receiptStorage')
const app = require('../app')

async function signupAndGetToken(email) {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({ email, password: 'password123' })
  return response.body.token
}

function authed(req, token) {
  return req.set('Authorization', `Bearer ${token}`)
}

const groceries = {
  amount: 42.5,
  category: 'Groceries',
  date: '2026-07-10',
  note: 'Weekly shop',
  type: 'expense',
}

async function createExpense(token) {
  const created = await authed(request(app).post('/api/expenses'), token).send(groceries)
  return created.body.expense._id
}

beforeEach(() => {
  jest.clearAllMocks()
  receiptStorage.ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  receiptStorage.buildKey.mockReturnValue('receipts/u/e/fixed.jpg')
  receiptStorage.putReceipt.mockResolvedValue()
  receiptStorage.deleteReceipt.mockResolvedValue()
  receiptStorage.getPresignedViewUrl.mockResolvedValue('https://signed.example/receipt')
})

describe('POST /api/expenses/:id/receipt', () => {
  it('uploads a receipt and attaches it to the expense', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    const response = await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt',
      Buffer.from('fake-image-bytes'),
      { filename: 'lunch.jpg', contentType: 'image/jpeg' }
    )

    expect(response.status).toBe(200)
    expect(response.body.expense.receipt).toMatchObject({
      key: 'receipts/u/e/fixed.jpg',
      filename: 'lunch.jpg',
      contentType: 'image/jpeg',
    })
    expect(receiptStorage.putReceipt).toHaveBeenCalledTimes(1)
  })

  it('replaces an existing receipt, uploading the new object before deleting the old one', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    receiptStorage.buildKey.mockReset()
    receiptStorage.buildKey.mockReturnValueOnce('receipts/u/e/first.jpg')
    receiptStorage.buildKey.mockReturnValueOnce('receipts/u/e/second.png')

    await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt',
      Buffer.from('first'),
      { filename: 'a.jpg', contentType: 'image/jpeg' }
    )
    const second = await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt',
      Buffer.from('second'),
      { filename: 'b.png', contentType: 'image/png' }
    )

    expect(second.status).toBe(200)
    expect(receiptStorage.deleteReceipt).toHaveBeenCalledWith('receipts/u/e/first.jpg')
    expect(receiptStorage.deleteReceipt).not.toHaveBeenCalledWith('receipts/u/e/second.png')
    expect(second.body.expense.receipt.filename).toBe('b.png')
    expect(receiptStorage.putReceipt.mock.invocationCallOrder[1]).toBeLessThan(
      receiptStorage.deleteReceipt.mock.invocationCallOrder[0]
    )
  })

  it('rejects an unsupported file type', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    const response = await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt',
      Buffer.from('plain text'),
      { filename: 'note.txt', contentType: 'text/plain' }
    )

    expect(response.status).toBe(400)
    expect(receiptStorage.putReceipt).not.toHaveBeenCalled()
  })

  it('rejects a file over 5 MB', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    const response = await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt',
      Buffer.alloc(5 * 1024 * 1024 + 1),
      { filename: 'big.jpg', contentType: 'image/jpeg' }
    )

    expect(response.status).toBe(400)
    expect(receiptStorage.putReceipt).not.toHaveBeenCalled()
  })

  it('returns 400 when the file is posted under the wrong field name', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    const response = await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'file',
      Buffer.from('x'),
      { filename: 'x.jpg', contentType: 'image/jpeg' }
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Invalid receipt upload')
  })

  it('returns 400 when no file is attached', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    const response = await authed(request(app).post(`/api/expenses/${id}/receipt`), token)

    expect(response.status).toBe(400)
  })

  it('returns 404 uploading to another user’s expense', async () => {
    const janeToken = await signupAndGetToken('jane@example.com')
    const bobToken = await signupAndGetToken('bob@example.com')
    const id = await createExpense(janeToken)

    const response = await authed(request(app).post(`/api/expenses/${id}/receipt`), bobToken).attach(
      'receipt',
      Buffer.from('x'),
      { filename: 'x.jpg', contentType: 'image/jpeg' }
    )

    expect(response.status).toBe(404)
  })

  it('rejects a request without a token', async () => {
    const response = await request(app)
      .post('/api/expenses/000000000000000000000000/receipt')
      .attach('receipt', Buffer.from('x'), { filename: 'x.jpg', contentType: 'image/jpeg' })

    expect(response.status).toBe(401)
  })
})

describe('GET /api/expenses/:id/receipt', () => {
  it('returns a presigned url for an expense with a receipt', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)
    await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt',
      Buffer.from('x'),
      { filename: 'r.jpg', contentType: 'image/jpeg' }
    )

    const response = await authed(request(app).get(`/api/expenses/${id}/receipt`), token)

    expect(response.status).toBe(200)
    expect(response.body.url).toBe('https://signed.example/receipt')
    expect(receiptStorage.getPresignedViewUrl).toHaveBeenCalledWith('receipts/u/e/fixed.jpg', 'r.jpg')
  })

  it('returns 404 when the expense has no receipt', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    const response = await authed(request(app).get(`/api/expenses/${id}/receipt`), token)

    expect(response.status).toBe(404)
  })

  it('rejects a request without a token', async () => {
    const response = await request(app).get('/api/expenses/000000000000000000000000/receipt')
    expect(response.status).toBe(401)
  })

  it('returns 404 viewing another user’s receipt', async () => {
    const janeToken = await signupAndGetToken('jane@example.com')
    const bobToken = await signupAndGetToken('bob@example.com')
    const id = await createExpense(janeToken)
    await authed(request(app).post(`/api/expenses/${id}/receipt`), janeToken).attach(
      'receipt',
      Buffer.from('x'),
      { filename: 'r.jpg', contentType: 'image/jpeg' }
    )

    const response = await authed(request(app).get(`/api/expenses/${id}/receipt`), bobToken)

    expect(response.status).toBe(404)
    expect(receiptStorage.getPresignedViewUrl).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/expenses/:id/receipt', () => {
  it('removes the receipt and unsets the subdocument', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)
    await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt',
      Buffer.from('x'),
      { filename: 'r.jpg', contentType: 'image/jpeg' }
    )

    const response = await authed(request(app).delete(`/api/expenses/${id}/receipt`), token)

    expect(response.status).toBe(200)
    expect(response.body.expense.receipt).toBeUndefined()
    expect(receiptStorage.deleteReceipt).toHaveBeenCalledWith('receipts/u/e/fixed.jpg')
  })

  it('returns 404 when there is no receipt to remove', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    const response = await authed(request(app).delete(`/api/expenses/${id}/receipt`), token)

    expect(response.status).toBe(404)
  })

  it('returns 404 removing another user’s receipt', async () => {
    const janeToken = await signupAndGetToken('jane@example.com')
    const bobToken = await signupAndGetToken('bob@example.com')
    const id = await createExpense(janeToken)
    await authed(request(app).post(`/api/expenses/${id}/receipt`), janeToken).attach(
      'receipt',
      Buffer.from('x'),
      { filename: 'r.jpg', contentType: 'image/jpeg' }
    )

    const response = await authed(request(app).delete(`/api/expenses/${id}/receipt`), bobToken)

    expect(response.status).toBe(404)
  })
})

describe('DELETE /api/expenses/:id cascade', () => {
  it('deletes the receipt object when the expense is deleted', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)
    await authed(request(app).post(`/api/expenses/${id}/receipt`), token).attach(
      'receipt',
      Buffer.from('x'),
      { filename: 'r.jpg', contentType: 'image/jpeg' }
    )

    const response = await authed(request(app).delete(`/api/expenses/${id}`), token)

    expect(response.status).toBe(200)
    expect(receiptStorage.deleteReceipt).toHaveBeenCalledWith('receipts/u/e/fixed.jpg')
  })

  it('does not call S3 when deleting an expense with no receipt', async () => {
    const token = await signupAndGetToken('jane@example.com')
    const id = await createExpense(token)

    await authed(request(app).delete(`/api/expenses/${id}`), token)

    expect(receiptStorage.deleteReceipt).not.toHaveBeenCalled()
  })
})

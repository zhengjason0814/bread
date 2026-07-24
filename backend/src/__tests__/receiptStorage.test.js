const { buildKey, EXTENSION_BY_TYPE } = require('../services/receiptStorage')

describe('receiptStorage.buildKey', () => {
  it('namespaces the key by user and expense with a type-derived extension', () => {
    const key = buildKey('user123', 'exp456', 'image/png')
    expect(key).toMatch(/^receipts\/user123\/exp456\/[0-9a-f-]+\.png$/)
  })

  it('maps every accepted content type to an extension', () => {
    expect(EXTENSION_BY_TYPE).toEqual({
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
    })
  })
})

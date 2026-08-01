const { buildKey, EXTENSION_BY_TYPE, contentDisposition } = require('../services/receiptStorage')

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

describe('receiptStorage.contentDisposition', () => {
  it('carries the original filename through', () => {
    expect(contentDisposition('starbucks-receipt.jpg')).toContain('filename="starbucks-receipt.jpg"')
  })

  it('strips CR/LF and quotes so a filename cannot inject a new header line', () => {
    const result = contentDisposition('evil".jpg\r\nX-Injected: yes')
    expect(result).not.toMatch(/[\r\n]/)
    expect(result.split('\n')).toHaveLength(1)
  })

  it('falls back to a safe default when the filename is empty or missing', () => {
    expect(contentDisposition('')).toContain('filename="receipt"')
    expect(contentDisposition(undefined)).toContain('filename="receipt"')
  })

  it('includes a UTF-8 encoded filename* for non-ASCII names', () => {
    const result = contentDisposition('café receipt.jpg')
    expect(result).toContain("filename*=UTF-8''")
  })

  it('defaults to inline disposition so it still opens in the browser', () => {
    expect(contentDisposition('r.jpg')).toMatch(/^inline;/)
  })
})

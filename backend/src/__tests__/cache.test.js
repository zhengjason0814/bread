const cache = require('../services/cache')
const redis = require('../config/redis')

describe('cache wrapper', () => {
  test('setJson then getJson round-trips a value', async () => {
    await cache.setJson('k1', { a: 1 }, 60)
    expect(await cache.getJson('k1')).toEqual({ a: 1 })
  })

  test('getJson returns null for a missing key', async () => {
    expect(await cache.getJson('missing')).toBeNull()
  })

  test('clearKeys removes keys', async () => {
    await cache.setJson('k2', 1, 60)
    await cache.setJson('k3', 2, 60)
    await cache.clearKeys(['k2', 'k3'])
    expect(await cache.getJson('k2')).toBeNull()
    expect(await cache.getJson('k3')).toBeNull()
  })

  test('getJson degrades to null when Redis throws', async () => {
    const spy = jest.spyOn(redis, 'get').mockRejectedValueOnce(new Error('down'))
    expect(await cache.getJson('k1')).toBeNull()
    spy.mockRestore()
  })

  test('setJson degrades to no-op when Redis throws', async () => {
    const spy = jest.spyOn(redis, 'set').mockRejectedValueOnce(new Error('down'))
    await expect(cache.setJson('k4', 1, 60)).resolves.toBeUndefined()
    spy.mockRestore()
  })
})

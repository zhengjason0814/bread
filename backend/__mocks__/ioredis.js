class FakeRedis {
  constructor() {
    this.store = new Map()
  }
  on() {
    return this
  }
  async get(key) {
    return this.store.has(key) ? this.store.get(key) : null
  }
  async set(key, value) {
    this.store.set(key, value)
    return 'OK'
  }
  async del(...keys) {
    let removed = 0
    for (const key of keys) {
      if (this.store.delete(key)) removed += 1
    }
    return removed
  }
  async flushall() {
    this.store.clear()
    return 'OK'
  }
  async quit() {
    return 'OK'
  }
}

module.exports = FakeRedis

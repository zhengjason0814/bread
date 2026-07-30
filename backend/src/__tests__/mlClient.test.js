jest.mock('axios')

const MIN_INSIGHT_TIMEOUT_MS = 10000
const INTERACTIVE_TIMEOUT_MS = 3000

function loadMlClient(insightTimeout) {
  jest.resetModules()
  const post = jest.fn().mockResolvedValue({ data: {} })
  const get = jest.fn().mockResolvedValue({ data: {} })
  const created = []
  require('axios').create = jest.fn((config) => {
    created.push(config)
    return { post, get }
  })

  if (insightTimeout === undefined) {
    delete process.env.ML_INSIGHT_TIMEOUT_MS
  } else {
    process.env.ML_INSIGHT_TIMEOUT_MS = insightTimeout
  }

  return { mlClient: require('../services/mlClient'), post, get, created }
}

afterEach(() => {
  delete process.env.ML_INSIGHT_TIMEOUT_MS
})

describe('mlClient timeouts', () => {
  test('predict tolerates a slow deployed ml-service', async () => {
    const { mlClient, post } = loadMlClient()
    await mlClient.predict([], '2026-07-30')
    expect(post.mock.calls[0][2].timeout).toBeGreaterThanOrEqual(MIN_INSIGHT_TIMEOUT_MS)
  })

  test('anomalies and recurring use the same insight timeout as predict', async () => {
    const { mlClient, post } = loadMlClient()
    await mlClient.predict([], '2026-07-30')
    await mlClient.detectAnomalies([])
    await mlClient.detectRecurring([])
    const timeouts = post.mock.calls.map((call) => call[2].timeout)
    expect(timeouts).toEqual([timeouts[0], timeouts[0], timeouts[0]])
    expect(timeouts[0]).toBeGreaterThanOrEqual(MIN_INSIGHT_TIMEOUT_MS)
  })

  test('classify stays on the fast interactive timeout', async () => {
    const { mlClient, post, created } = loadMlClient()
    await mlClient.classify('starbucks')
    expect(created[0].timeout).toBe(INTERACTIVE_TIMEOUT_MS)
    expect(post.mock.calls[0][2]).toBeUndefined()
  })

  test('ML_INSIGHT_TIMEOUT_MS overrides the insight default', async () => {
    const { mlClient, post } = loadMlClient('25000')
    await mlClient.predict([], '2026-07-30')
    expect(post.mock.calls[0][2].timeout).toBe(25000)
  })
})

const FALLBACK_RETRY_SECONDS = 60
const DEFAULT_MESSAGE = 'Too many requests — the oven needs a minute.'

const listeners = new Set()

export function formatWait(seconds) {
  if (seconds < 60) return `${seconds}s`
  return `${Math.ceil(seconds / 60)}m`
}

export function baseMessage(message) {
  return message || DEFAULT_MESSAGE
}

export function rateLimitMessage(message, seconds) {
  const base = baseMessage(message)
  if (!seconds || seconds <= 0) return base
  return `${base} Try again in ${formatWait(seconds)}.`
}

export function retryAfterSeconds(response) {
  const fromBody = Number(response?.data?.retryAfter)
  if (Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody)
  const fromHeader = Number(response?.headers?.['retry-after'])
  if (Number.isFinite(fromHeader) && fromHeader > 0) return Math.ceil(fromHeader)
  return FALLBACK_RETRY_SECONDS
}

export function onRateLimited(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function reportRateLimit(notice) {
  listeners.forEach((listener) => listener(notice))
}

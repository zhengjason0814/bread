import { useEffect, useState } from 'react'
import { rateLimitMessage } from '../rateLimit'

function secondsLeft(until) {
  return Math.max(0, Math.ceil((until - Date.now()) / 1000))
}

function RateLimitBanner({ message, until, onExpire }) {
  const [remaining, setRemaining] = useState(() => secondsLeft(until))

  useEffect(() => {
    setRemaining(secondsLeft(until))
    const timer = setInterval(() => {
      const next = secondsLeft(until)
      setRemaining(next)
      if (next <= 0) onExpire()
    }, 1000)
    return () => clearInterval(timer)
  }, [until, onExpire])

  return (
    <div
      role="status"
      className="bg-notice-soft border-b border-notice px-4 sm:px-[30px] py-3 text-sm text-notice-ink"
    >
      <span className="sr-only">{message}</span>
      <span aria-hidden="true">{rateLimitMessage(message, remaining)}</span>
    </div>
  )
}

export default RateLimitBanner

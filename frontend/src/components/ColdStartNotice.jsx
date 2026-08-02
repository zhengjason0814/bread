import { useEffect, useState } from 'react'

const SLOW_AFTER_MS = 3000

function ClockIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 5.5V10l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ColdStartNotice({ loading }) {
  const [slow, setSlow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!loading) {
      setSlow(false)
      return undefined
    }
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [loading])

  if (!slow || dismissed) return null

  return (
    <div className="px-4 sm:px-[30px] pt-3.5">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-tile border border-accent bg-accent-100 px-4 py-3 shadow-card"
      >
        <ClockIcon className="w-5 h-5 flex-none text-accent-deep" />
        <div className="flex-1 min-w-[240px] text-sm text-accent-deep leading-snug">
          <p className="font-semibold text-ink">Waking up the server</p>
          <p className="mt-0.5">
            This app is free hosted, meaning its put to sleep when idle, so the first load might take a second!
            It&rsquo;s quick after that. Thanks for holding on!
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex-none grid place-items-center w-8 h-8 rounded-full cursor-pointer text-lg leading-none text-accent-deep hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default ColdStartNotice

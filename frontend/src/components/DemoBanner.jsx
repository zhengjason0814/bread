import { Link } from 'react-router-dom'
import Button from '../ui/Button'

function InfoIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="8.25" fill="currentColor" />
      <path
        d="M10 5.9v.1M10 9v5"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function DemoBanner({ onReset, resetting }) {
  return (
    <div className="px-4 sm:px-[30px] pt-3.5">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-tile border border-notice bg-notice-soft px-4 py-3 shadow-card">
        <InfoIcon className="w-5 h-5 flex-none text-notice" />
        <div className="flex-1 min-w-[240px] text-sm text-notice-ink leading-snug">
          <p className="font-semibold text-ink">You&rsquo;re exploring a demo with sample data.</p>
          <p className="mt-0.5">
            Receipt uploads and bank connections are turned off.{' '}
            <Link to="/signup" className="font-medium underline underline-offset-2">
              Sign up
            </Link>{' '}
            to use them and keep your own data.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={onReset}
          disabled={resetting}
          className="flex-none border-notice text-notice-ink hover:bg-notice/15"
        >
          {resetting ? 'Resetting…' : 'Reset demo'}
        </Button>
      </div>
    </div>
  )
}

export default DemoBanner

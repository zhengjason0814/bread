import { Link } from 'react-router-dom'

function DemoBanner({ onReset, resetting }) {
  return (
    <div className="bg-amber-100 border-b border-amber-300 px-6 py-3 text-sm text-amber-900 flex flex-wrap items-center justify-between gap-2">
      <span>
        You&rsquo;re exploring a demo with sample data. Receipt uploads and bank connections are
        disabled &mdash; <Link to="/signup" className="font-medium underline">sign up</Link> to use
        them and save your own data.
      </span>
      <button
        type="button"
        onClick={onReset}
        disabled={resetting}
        className="rounded-md border border-amber-400 px-3 py-1 font-medium text-amber-900 hover:bg-amber-200 disabled:opacity-50"
      >
        {resetting ? 'Resetting…' : 'Reset demo'}
      </button>
    </div>
  )
}

export default DemoBanner

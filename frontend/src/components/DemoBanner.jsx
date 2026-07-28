import { Link } from 'react-router-dom'
import Button from '../ui/Button'

function DemoBanner({ onReset, resetting }) {
  return (
    <div className="bg-accent-100 border-b border-accent-200 px-4 sm:px-[30px] py-3 text-sm text-accent-deep flex flex-wrap items-center justify-between gap-2">
      <span>
        You&rsquo;re exploring a demo with sample data. Receipt uploads and bank connections are
        disabled &mdash; <Link to="/signup" className="font-medium underline">sign up</Link> to use
        them and save your own data.
      </span>
      <Button variant="ghost" onClick={onReset} disabled={resetting} className="text-accent-deep">
        {resetting ? 'Resetting…' : 'Reset demo'}
      </Button>
    </div>
  )
}

export default DemoBanner

import { NavLink } from 'react-router-dom'
import { safeToSpend } from '../budgets'
import { formatMoney } from '../currencies'
import Label from '../ui/Label'
import BreadMark from '../ui/BreadMark'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Expenses & Income' },
  { to: '/charts', label: 'Charts' },
  { to: '/anomalies', label: 'Anomalies' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/recurring', label: 'Recurring Charges' },
  { to: '/accounts', label: 'Accounts' },
]

function Sidebar({ expenses, budgets, baseCurrency, open, onClose }) {
  const remaining = safeToSpend(expenses, budgets)

  return (
    <>
      {open && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[rgba(46,43,37,0.5)] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[232px] flex-none bg-panel border-r border-rule px-4 py-[22px] flex flex-col gap-[26px] overflow-y-auto transition-[transform,visibility] duration-200 ease-out lg:static lg:z-auto lg:h-screen lg:translate-x-0 lg:visible ${
          open ? 'translate-x-0' : '-translate-x-full invisible'
        }`}
      >
        <div className="flex items-center gap-3 px-2.5">
          <div className="w-9 h-9 flex-none rounded-full bg-accent grid place-items-center text-page">
            <BreadMark className="w-5 h-5" />
          </div>
          <span className="font-display text-2xl">Bread</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="ml-auto text-ink-muted px-2 py-1 rounded-full cursor-pointer hover:bg-sand focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `px-3.5 py-[9px] rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
                  isActive ? 'bg-accent text-page' : 'text-ink-nav hover:bg-sand'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto bg-sand rounded-tile px-[18px] py-4">
          <Label>Safe to spend</Label>
          {remaining === null ? (
            <NavLink to="/budgets" onClick={onClose} className="font-display text-lg text-accent-link">
              Set a budget →
            </NavLink>
          ) : (
            <>
              <p className="font-display text-[26px] mt-1">{formatMoney(remaining, baseCurrency)}</p>
              <p className="text-xs text-ink-secondary mt-0.5">left this month</p>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar

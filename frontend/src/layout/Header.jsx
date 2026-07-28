import { Link, useLocation } from 'react-router-dom'
import { CURRENCIES } from '../currencies'
import { Select } from '../ui/Field'
import Button from '../ui/Button'

const TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Expenses & Income',
  '/charts': 'Charts',
  '/anomalies': 'Anomalies',
  '/budgets': 'Budgets',
  '/recurring': 'Recurring Charges',
  '/accounts': 'Accounts',
  '/admin': 'Admin',
}

function Header({ baseCurrency, onBaseCurrencyChange, onLogout, isAdmin, onOpenNav, navOpen }) {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-30 bg-panel px-4 sm:px-[30px] pt-4 sm:pt-5 pb-4 border-b border-rule flex items-center flex-wrap gap-x-[18px] gap-y-3">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        aria-expanded={navOpen}
        className="text-xl leading-none px-2 py-1 -ml-2 rounded-full cursor-pointer text-ink-nav hover:bg-sand focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 lg:hidden"
      >
        ☰
      </button>
      <h1 className="font-display text-lg sm:text-xl min-w-0 truncate">
        {TITLES[pathname] ?? 'Dashboard'}
      </h1>
      <div className="ml-auto flex items-center gap-2.5 sm:gap-3.5">
        <span className="hidden sm:inline text-[13px] text-ink-secondary">Home currency</span>
        <Select
          value={baseCurrency}
          onChange={onBaseCurrencyChange}
          aria-label="Home currency"
          className="w-auto min-h-[34px]"
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>
        {isAdmin && (
          <Link to="/admin" className="text-sm text-accent-link hover:text-accent-deep">
            Admin
          </Link>
        )}
        <Button variant="secondary" onClick={onLogout}>
          Log out
        </Button>
      </div>
    </header>
  )
}

export default Header

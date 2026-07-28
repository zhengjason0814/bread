import { Link, useLocation } from 'react-router-dom'
import { CURRENCIES } from '../currencies'
import { Select } from '../ui/Field'
import Button from '../ui/Button'
import PanelIcon from '../ui/PanelIcon'

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

function Header({
  baseCurrency,
  onBaseCurrencyChange,
  onLogout,
  isAdmin,
  onOpenNav,
  navOpen,
}) {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-30 bg-panel px-4 sm:px-[30px] py-4 border-b border-rule flex items-center gap-3 sm:gap-[18px]">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Show navigation"
        aria-expanded={navOpen}
        title="Show navigation"
        className="flex-none grid place-items-center w-8 h-8 -ml-1.5 rounded-full cursor-pointer text-ink-muted hover:bg-sand hover:text-ink focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 lg:hidden"
      >
        <PanelIcon className="w-[18px] h-[18px]" />
      </button>
      <h1 className="font-display text-lg sm:text-xl leading-tight min-w-0 flex-1 truncate">
        {TITLES[pathname] ?? 'Dashboard'}
      </h1>
      <div className="flex-none flex items-center gap-2.5 sm:gap-3.5">
        <span className="hidden sm:inline text-[13px] text-ink-secondary whitespace-nowrap">
          Home currency
        </span>
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
          <Link to="/admin" className="text-sm text-accent-link hover:text-accent-deep whitespace-nowrap">
            Admin
          </Link>
        )}
        <Button variant="secondary" onClick={onLogout} className="whitespace-nowrap">
          Log out
        </Button>
      </div>
    </header>
  )
}

export default Header

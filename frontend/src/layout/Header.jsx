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

function Header({ baseCurrency, onBaseCurrencyChange, onLogout, isAdmin }) {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-30 bg-panel px-[30px] pt-5 pb-4 border-b border-rule flex items-center gap-[18px]">
      <h1 className="font-display text-xl">{TITLES[pathname] ?? 'Dashboard'}</h1>
      <div className="ml-auto flex items-center gap-3.5">
        <span className="text-[13px] text-ink-secondary">Home currency</span>
        <Select value={baseCurrency} onChange={onBaseCurrencyChange} className="w-auto min-h-[34px]">
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

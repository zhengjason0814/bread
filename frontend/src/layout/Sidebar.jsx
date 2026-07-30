import { NavLink } from 'react-router-dom'
import { safeToSpend } from '../budgets'
import { formatMoney } from '../currencies'
import Label from '../ui/Label'
import breadMarkInverse from '../assets/bread-mark-inverse.svg'
import PanelIcon from '../ui/PanelIcon'
import {
  AnomalyIcon,
  BankIcon,
  BarChartIcon,
  BudgetIcon,
  DashboardIcon,
  ForecastIcon,
  MoneyBagIcon,
  RecurringIcon,
} from '../ui/NavIcons'

const NAV = [
  { to: '/', label: 'Dashboard', end: true, Icon: DashboardIcon },
  { to: '/transactions', label: 'Expenses & Income', Icon: MoneyBagIcon },
  { to: '/charts', label: 'Charts', Icon: BarChartIcon },
  { to: '/predictions', label: 'Predictions', Icon: ForecastIcon },
  { to: '/anomalies', label: 'Anomalies', Icon: AnomalyIcon },
  { to: '/budgets', label: 'Budgets', Icon: BudgetIcon },
  { to: '/recurring', label: 'Recurring Charges', Icon: RecurringIcon },
  { to: '/accounts', label: 'Accounts', Icon: BankIcon },
]

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2'

function Sidebar({ expenses, budgets, baseCurrency, open, collapsed, onClose, onToggleCollapse }) {
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
        className={`fixed inset-y-0 left-0 z-50 w-[232px] flex-none bg-panel border-r border-rule overflow-hidden transition-[transform,visibility,width] duration-200 ease-out lg:static lg:z-auto lg:h-screen lg:translate-x-0 lg:visible ${
          open ? 'translate-x-0' : '-translate-x-full invisible'
        } ${collapsed ? 'lg:w-[68px]' : 'lg:w-[232px]'}`}
      >
        <div
          className={`h-full w-[232px] px-4 py-[22px] flex flex-col gap-[26px] overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-out ${
            collapsed ? 'lg:w-[68px] lg:px-2.5 lg:items-center' : 'lg:w-[232px]'
          }`}
        >
          <div className={`flex items-center gap-3 w-full ${collapsed ? '' : 'pl-2.5'}`}>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`w-9 h-9 flex-none rounded-full bg-accent grid place-items-center text-page cursor-pointer transition-colors hover:bg-accent-hover ${FOCUS_RING} ${
                collapsed ? 'lg:mx-auto' : ''
              }`}
            >
              <img src={breadMarkInverse} alt="" className="w-5 h-5" />
            </button>
            <span
              className={`font-display text-2xl whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}
            >
              Bread
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className={`ml-auto flex-none grid place-items-center w-8 h-8 rounded-full cursor-pointer text-lg leading-none text-ink-muted hover:bg-sand hover:text-ink lg:hidden ${FOCUS_RING}`}
            >
              ✕
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className={`ml-auto flex-none place-items-center w-8 h-8 rounded-full cursor-pointer text-ink-muted hover:bg-sand hover:text-ink hidden ${FOCUS_RING} ${
                collapsed ? '' : 'lg:grid'
              }`}
            >
              <PanelIcon className="w-[18px] h-[18px]" />
            </button>
          </div>

          <nav className={`flex flex-col gap-1 w-full ${collapsed ? 'lg:items-center' : ''}`}>
            {NAV.map(({ to, label, end, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                title={label}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-[9px] rounded-full text-sm transition-colors ${FOCUS_RING} ${
                    collapsed ? 'lg:w-11 lg:h-11 lg:px-0 lg:gap-0 lg:justify-center lg:rounded-2xl' : ''
                  } ${isActive ? 'bg-accent text-page' : 'text-ink-nav hover:bg-sand'}`
                }
              >
                <Icon className="w-[18px] h-[18px] flex-none" />
                <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div
            className={`mt-auto w-full bg-sand rounded-tile px-[18px] py-4 ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            <Label>Safe to spend</Label>
            {remaining === null ? (
              <NavLink
                to="/budgets"
                onClick={onClose}
                className="font-display text-lg text-accent-link"
              >
                Set a budget →
              </NavLink>
            ) : (
              <>
                <p className="font-display text-[26px] mt-1">
                  {formatMoney(remaining, baseCurrency)}
                </p>
                <p className="text-xs text-ink-secondary mt-0.5">left this month</p>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

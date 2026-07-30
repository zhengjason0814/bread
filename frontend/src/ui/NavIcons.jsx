const BASE = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function DashboardIcon({ className = '' }) {
  return (
    <svg {...BASE} className={className}>
      <rect x="2.6" y="2.6" width="6.4" height="6.4" rx="1.6" />
      <rect x="11" y="2.6" width="6.4" height="6.4" rx="1.6" />
      <rect x="2.6" y="11" width="6.4" height="6.4" rx="1.6" />
      <rect x="11" y="11" width="6.4" height="6.4" rx="1.6" />
    </svg>
  )
}

export function MoneyBagIcon({ className = '' }) {
  return (
    <svg {...BASE} className={className}>
      <path d="M7.6 2.8h4.8l-1.5 2.9H9.1L7.6 2.8Z" />
      <path d="M9.1 5.7a5.5 5.5 0 0 0-3.9 5.4c0 3.3 2.1 5.7 4.8 5.7s4.8-2.4 4.8-5.7a5.5 5.5 0 0 0-3.9-5.4" />
      <path d="M8.4 10.4h3.2" />
    </svg>
  )
}

export function BarChartIcon({ className = '' }) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3 16.6h14" />
      <rect x="4.4" y="9.4" width="2.9" height="5" rx="1" />
      <rect x="8.6" y="5.6" width="2.9" height="8.8" rx="1" />
      <rect x="12.8" y="11.4" width="2.9" height="3" rx="1" />
    </svg>
  )
}

export function ForecastIcon({ className = '' }) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3.4 14.8 7.2 11l2.6 2.1" />
      <path d="M9.8 13.1 16 6.6" strokeDasharray="2.4 2.2" />
      <path d="M12.8 6.4h3.6V10" />
    </svg>
  )
}

export function AnomalyIcon({ className = '' }) {
  return (
    <svg {...BASE} className={className}>
      <path d="M2.6 12.4c0-3.1 1.9-5.1 4.3-5.1s4.3 2 4.3 5.1v2.2a1.4 1.4 0 0 1-1.4 1.4H4a1.4 1.4 0 0 1-1.4-1.4v-2.2Z" />
      <path d="M15.6 4.2v5.4" />
      <path d="M15.6 12.6h.01" />
    </svg>
  )
}

export function BudgetIcon({ className = '' }) {
  return (
    <svg {...BASE} className={className}>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.2" />
      <path d="M10 9.9h.01" />
    </svg>
  )
}

export function RecurringIcon({ className = '' }) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3.2 10a6.8 6.8 0 0 1 11.7-4.7" />
      <path d="M16.8 10a6.8 6.8 0 0 1-11.7 4.7" />
      <path d="M15.4 2.2v3.4H12" />
      <path d="M4.6 17.8v-3.4H8" />
    </svg>
  )
}

export function BankIcon({ className = '' }) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3 8.4 10 3.8l7 4.6" />
      <path d="M5.4 9.2v5.6M10 9.2v5.6M14.6 9.2v5.6" />
      <path d="M3.2 16.6h13.6" />
    </svg>
  )
}

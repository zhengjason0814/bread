const CONTROL =
  'w-full min-h-9 rounded-full border border-rule bg-sand px-3.5 py-1.5 text-sm text-ink caret-accent hover:border-ink/45 focus-visible:border-accent focus-visible:outline-none'

export function Input({ className = '', ...rest }) {
  return <input className={`${CONTROL} ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }) {
  return (
    <select className={`${CONTROL} ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-ink-secondary mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-accent-deep mt-1">{error}</span>}
    </label>
  )
}

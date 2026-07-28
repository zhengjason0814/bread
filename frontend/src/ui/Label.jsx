function Label({ className = '', children }) {
  return (
    <p className={`text-label uppercase tracking-label text-ink-muted ${className}`}>{children}</p>
  )
}

export default Label

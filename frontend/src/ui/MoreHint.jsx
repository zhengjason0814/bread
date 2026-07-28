function MoreHint({ count, noun, className = '' }) {
  if (!count || count <= 0) return null

  return (
    <p className={`text-center text-ink-faint text-[15px] leading-none tracking-[0.2em] ${className}`}>
      <span aria-hidden="true">…</span>
      <span className="sr-only">
        {count} more {noun} — open this page to see all
      </span>
    </p>
  )
}

export default MoreHint

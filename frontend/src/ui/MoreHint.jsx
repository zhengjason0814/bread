function MoreHint({ count, noun, className = '' }) {
  if (!count || count <= 0) return null

  return (
    <p className={`flex items-center gap-[3px] ${className}`}>
      <span className="w-[3px] h-[3px] rounded-full bg-ink-faint" aria-hidden="true" />
      <span className="w-[3px] h-[3px] rounded-full bg-ink-faint" aria-hidden="true" />
      <span className="w-[3px] h-[3px] rounded-full bg-ink-faint" aria-hidden="true" />
      <span className="sr-only">
        {count} more {noun} — open this page to see all
      </span>
    </p>
  )
}

export default MoreHint

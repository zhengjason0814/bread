function BreadMark({ className = '', scoreClassName = 'stroke-accent' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 26c0-9.94 7.16-16 16-16s16 6.06 16 16v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-8Z"
        fill="currentColor"
      />
      <path
        d="M17 17.5 13.5 24M24 15.5 20.5 22M31 17.5 27.5 24"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={scoreClassName}
      />
    </svg>
  )
}

export default BreadMark

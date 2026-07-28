function PanelIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="3.75" width="15" height="12.5" rx="3" />
      <line x1="8" y1="3.75" x2="8" y2="16.25" />
    </svg>
  )
}

export default PanelIcon

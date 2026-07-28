export function Table({ className = '', children }) {
  return <table className={`w-full border-collapse text-sm ${className}`}>{children}</table>
}

export function Th({ align = 'left', className = '', children }) {
  return (
    <th
      className={`text-[11px] uppercase tracking-[0.08em] text-ink-muted font-normal py-2 border-b border-rule ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
    >
      {children}
    </th>
  )
}

export function Td({ align = 'left', className = '', children }) {
  return (
    <td
      className={`py-2 border-b border-rule-soft ${align === 'right' ? 'text-right' : ''} ${className}`}
    >
      {children}
    </td>
  )
}

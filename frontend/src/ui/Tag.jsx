import { categoryTagStyle } from '../categoryColors'

const VARIANTS = {
  accent: 'bg-accent-100 text-accent-deep',
  sage: 'bg-sage-100 text-sage-darkest',
  outline: 'border border-accent text-accent',
  category: '',
}

function Tag({ variant = 'accent', category, className = '', style, children }) {
  const resolved = variant === 'category' ? { ...categoryTagStyle(category), ...style } : style

  return (
    <span
      style={resolved}
      className={`inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] tracking-[0.02em] whitespace-nowrap ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Tag

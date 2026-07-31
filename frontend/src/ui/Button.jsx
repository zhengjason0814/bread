const VARIANTS = {
  primary: 'bg-accent text-page hover:bg-accent-hover active:bg-accent-active',
  secondary: 'border border-rule text-ink hover:bg-ink/7 active:bg-ink/14',
  ghost: 'text-accent-deep px-1 hover:bg-accent/12 active:bg-accent/20',
}

function Button({ variant = 'secondary', stopPropagation = false, onClick, className = '', ...rest }) {
  function handleClick(event) {
    if (stopPropagation) event.stopPropagation()
    onClick?.(event)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold text-sm leading-tight px-4 py-[9px] cursor-pointer transition-colors disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  )
}

export default Button

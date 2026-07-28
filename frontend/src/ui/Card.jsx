function Card({ interactive = false, onClick, className = '', children, ...rest }) {
  const interactiveProps = interactive
    ? {
        role: 'button',
        tabIndex: 0,
        onClick,
        onKeyDown: (event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick?.(event)
          }
        },
      }
    : {}

  return (
    <div
      {...interactiveProps}
      className={`bg-card rounded-card px-5 py-[18px] shadow-card ${
        interactive
          ? 'cursor-pointer transition duration-150 ease-out hover:-translate-y-[3px] hover:shadow-lift focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Card

const LIFT = 'transition duration-150 ease-out hover:-translate-y-[3px] hover:shadow-lift'
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2'

function Card({ interactive = false, lift = false, onClick, className = '', children, ...rest }) {
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
        interactive || lift ? LIFT : ''
      } ${interactive ? `cursor-pointer ${FOCUS_RING}` : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Card

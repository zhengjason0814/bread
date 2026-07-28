import { useEffect } from 'react'
import Button from './Button'

function Dialog({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-40 grid place-items-center p-4 bg-[rgba(46,43,37,0.5)] overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-[min(620px,100%)] bg-card rounded-card p-[18px] shadow-lift flex flex-col gap-[18px]"
      >
        <div className="flex items-center">
          <h2 className="font-display text-2xl">{title}</h2>
          <Button variant="ghost" className="ml-auto" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Dialog

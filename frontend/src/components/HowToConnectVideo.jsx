import { useState } from 'react'
import howToVideo from '../assets/HowToConnect.mp4'
import howToPoster from '../assets/HowToConnect.poster.jpg'
import Button from '../ui/Button'

function HowToConnectVideo({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="flex flex-col gap-3 pb-1">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-[15px]">Connecting a sandbox bank</h2>
        <Button variant="ghost" className="ml-auto" onClick={() => setOpen(!open)}>
          {open ? 'Hide walkthrough' : 'Watch walkthrough'}
        </Button>
      </div>

      {open && (
        <>
          <p className="text-sm text-ink-secondary">
            Plaid runs in Sandbox, so pick any bank and sign in with{' '}
            <span className="font-medium text-ink">user_good</span> and{' '}
            <span className="font-medium text-ink">pass_good</span>. Any code works at the
            verification step.
          </p>
          <video
            src={howToVideo}
            poster={howToPoster}
            controls
            playsInline
            preload="none"
            aria-label="Walkthrough of connecting a Plaid sandbox bank"
            className="block w-full max-w-[720px] rounded-tile shadow-card"
          />
        </>
      )}
    </section>
  )
}

export default HowToConnectVideo

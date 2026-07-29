import { useEffect, useId, useRef, useState } from 'react'

const LOAF = 'M7 26C7 16.9 14.6 11 24 11s17 5.9 17 15v7a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-7Z'
const EYE = 'M0-5.4Q3.8 0 0 5.4Q-3.8 0 0-5.4Z'

const VIEWBOX = 48
const LOAF_SCALE = 0.86
const LOAF_CENTRE_Y = 17.6
const BASKET_LIFT = 1.4

const EYE_POSITIONS = [
  { x: 19.8, y: 20.4 },
  { x: 28.2, y: 20.4 },
]

const EYES_IN_VIEWBOX = EYE_POSITIONS.map((eye) => ({
  x: 24 + (eye.x - 24) * LOAF_SCALE,
  y: LOAF_CENTRE_Y + (eye.y - 24) * LOAF_SCALE,
}))

const PUPIL_RADIUS = 1.9
const MAX_LOOK_X = 0.7
const MAX_LOOK_Y = 2
const FULL_TRAVEL_PX = 150
const CENTRED = EYE_POSITIONS.map(() => ({ x: 0, y: 0 }))

const BLINK_MS = 130
const TRACK = 'transform 140ms ease-out'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches
}

function BreadMascot({ className = '' }) {
  const clipId = useId()
  const svgRef = useRef(null)
  const frameRef = useRef(0)
  const [look, setLook] = useState(CENTRED)
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return undefined

    function aim(pointerX, pointerY) {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      if (!rect.width) return

      setLook(
        EYES_IN_VIEWBOX.map((eye) => {
          const centreX = rect.left + (eye.x / VIEWBOX) * rect.width
          const centreY = rect.top + (eye.y / VIEWBOX) * rect.height
          const dx = pointerX - centreX
          const dy = pointerY - centreY
          const distance = Math.hypot(dx, dy)
          if (!distance) return { x: 0, y: 0 }
          const reach = Math.min(1, distance / FULL_TRAVEL_PX)
          return {
            x: (dx / distance) * MAX_LOOK_X * reach,
            y: (dy / distance) * MAX_LOOK_Y * reach,
          }
        })
      )
    }

    function handleMove(event) {
      const { clientX, clientY } = event
      if (frameRef.current) return
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0
        aim(clientX, clientY)
      })
    }

    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handleMove)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return undefined

    const timers = new Set()

    function later(fn, ms) {
      const id = setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
    }

    function nextBlink() {
      setBlinking(true)
      later(() => {
        setBlinking(false)
        later(nextBlink, 2600 + Math.random() * 4000)
      }, BLINK_MS)
    }

    later(nextBlink, 2000 + Math.random() * 2500)

    return () => {
      timers.forEach(clearTimeout)
      timers.clear()
    }
  }, [])

  return (
    <svg ref={svgRef} viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={EYE} />
        </clipPath>
      </defs>

      <g transform={`translate(24 ${LOAF_CENTRE_Y}) scale(${LOAF_SCALE}) translate(-24 -24)`}>
        <path d={LOAF} className="fill-accent" />
        {EYE_POSITIONS.map((eye, index) => (
          <g key={eye.x} transform={`translate(${eye.x} ${eye.y}) rotate(-5)`}>
            {blinking ? (
              <rect x="-1.9" y="-0.5" width="3.8" height="1" rx="0.5" className="fill-accent-100" />
            ) : (
              <>
                <path d={EYE} className="fill-accent-100" />
                <g clipPath={`url(#${clipId})`}>
                  <g
                    style={{
                      transform: `translate(${look[index].x}px, ${look[index].y}px)`,
                      transition: TRACK,
                    }}
                  >
                    <circle r={PUPIL_RADIUS} className="fill-ink" />
                    <circle cx="-0.6" cy="-0.75" r="0.5" className="fill-card" />
                  </g>
                </g>
              </>
            )}
          </g>
        ))}
      </g>

      <g transform={`translate(0 -${BASKET_LIFT})`}>
        <path
          d="M4.5 29h39l-3.5 11.6a3.4 3.4 0 0 1-3.3 2.5H11.3a3.4 3.4 0 0 1-3.3-2.5L4.5 29Z"
          className="fill-accent-deep"
        />
        <path
          d="M10.5 34h27M12 38.5h24"
          className="stroke-accent-400"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M17.5 31.5v11M24 31.5v11.5M30.5 31.5v11"
          className="stroke-accent-400"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.3"
        />
        <rect x="4.5" y="26.4" width="39" height="5.2" rx="2.6" className="fill-card" />
      </g>
    </svg>
  )
}

export default BreadMascot

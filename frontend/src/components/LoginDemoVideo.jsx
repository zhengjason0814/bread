import { useEffect, useState } from 'react'
import demoVideo from '../assets/VideoDemo.mp4'
import demoPoster from '../assets/VideoDemo.poster.jpg'

function LoginDemoVideo() {
  const [motionAllowed, setMotionAllowed] = useState(true)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setMotionAllowed(!query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return (
    <div className="relative hidden lg:block w-full max-w-[720px] xl:max-w-[840px]">
      <div className="rounded-card bg-card/70 backdrop-blur-xl border border-white/100 shadow-card p-1">
        <div className="rounded-tile overflow-hidden">
          {motionAllowed ? (
            <video
              src={demoVideo}
              poster={demoPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="A short tour of the Bread dashboard"
              className="block w-full h-auto"
            />
          ) : (
            <img src={demoPoster} alt="The Bread dashboard" className="block w-full h-auto" />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginDemoVideo

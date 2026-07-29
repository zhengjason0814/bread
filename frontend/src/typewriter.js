import { useEffect, useState } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches
}

export function useTypewriter(text, msPerCharacter = 24) {
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? text : ''))

  useEffect(() => {
    if (prefersReducedMotion() || !text) {
      setTyped(text)
      return undefined
    }

    setTyped('')
    let count = 0
    const timer = setInterval(() => {
      count += 1
      setTyped(text.slice(0, count))
      if (count >= text.length) clearInterval(timer)
    }, msPerCharacter)

    return () => clearInterval(timer)
  }, [text, msPerCharacter])

  return { typed, done: typed === text }
}

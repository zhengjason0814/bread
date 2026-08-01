import { useEffect, useRef, useState } from 'react'
import { GOOGLE_CLIENT_ID, loadGoogleScript } from '../googleSignIn'

function GoogleSignInButton({ onCredential, onError }) {
  const holderRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined
    let cancelled = false

    loadGoogleScript()
      .then((google) => {
        if (cancelled || !holderRef.current) return
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        })
        google.accounts.id.renderButton(holderRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 340,
        })
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) onError('Could not load Google sign-in')
      })

    return () => {
      cancelled = true
    }
  }, [onCredential, onError])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-rule" />
        <span className="text-xs text-ink-muted">or</span>
        <span className="h-px flex-1 bg-rule" />
      </div>
      <div className="flex justify-center min-h-[44px]">
        {!ready && <span className="text-sm text-ink-muted">Loading Google sign-in…</span>}
        <div ref={holderRef} className={ready ? '' : 'hidden'} />
      </div>
    </div>
  )
}

export default GoogleSignInButton

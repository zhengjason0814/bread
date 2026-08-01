const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

let scriptPromise = null

export function loadGoogleScript() {
  if (!GOOGLE_CLIENT_ID) return Promise.reject(new Error('No Google client id configured'))
  if (window.google?.accounts?.id) return Promise.resolve(window.google)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
    const script = existing ?? document.createElement('script')
    script.addEventListener('load', () => resolve(window.google))
    script.addEventListener('error', () => {
      scriptPromise = null
      reject(new Error('Could not reach Google'))
    })
    if (!existing) {
      script.src = SCRIPT_SRC
      script.async = true
      document.head.appendChild(script)
    }
  })

  return scriptPromise
}

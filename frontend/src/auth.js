export function getToken() {
  return localStorage.getItem('token')
}

export function saveToken(token) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

export function isLoggedIn() {
  return Boolean(getToken())
}

export function readTokenPayload() {
  const token = getToken()
  if (!token) return null
  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = segment.padEnd(Math.ceil(segment.length / 4) * 4, '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function isDemoSession() {
  return readTokenPayload()?.isDemo === true
}

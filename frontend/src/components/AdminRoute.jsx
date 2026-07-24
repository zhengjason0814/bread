import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import client from '../api/client'
import { isLoggedIn, clearToken } from '../auth'

function AdminRoute({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    if (!isLoggedIn()) {
      setStatus('anonymous')
      return
    }
    let cancelled = false
    client
      .get('/auth/me')
      .then((response) => {
        if (!cancelled) setStatus(response.data.user.isAdmin ? 'admin' : 'denied')
      })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 401) {
          clearToken()
          setStatus('anonymous')
        } else {
          setStatus('denied')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'checking') return null
  if (status === 'anonymous') return <Navigate to="/login" replace />
  if (status === 'denied') return <Navigate to="/" replace />
  return children
}

export default AdminRoute

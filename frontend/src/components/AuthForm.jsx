import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { saveToken } from '../auth'
import { startDemo } from '../demo'
import Card from '../ui/Card'
import Button from '../ui/Button'
import GoogleSignInButton from './GoogleSignInButton'
import breadMark from '../assets/bread-mark.svg'
import authBackground from '../assets/auth-background.png'
import { Field, Input } from '../ui/Field'

function AuthForm({ title, endpoint, buttonLabel, footer }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await client.post(endpoint, { email, password })
      saveToken(response.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleCredential = useCallback(
    async (credential) => {
      setError('')
      try {
        const response = await client.post('/auth/google', { credential })
        saveToken(response.data.token)
        navigate('/')
      } catch (err) {
        setError(err.response?.data?.error ?? 'Could not sign in with Google')
      }
    },
    [navigate],
  )

  const handleGoogleError = useCallback((message) => setError(message), [])

  async function handleDemo() {
    setError('')
    setDemoLoading(true)
    try {
      const token = await startDemo()
      saveToken(token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Could not start the demo')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center lg:justify-end px-4 lg:pr-[9%] xl:pr-[11%] py-10 overflow-hidden bg-page">
      <img
        src={authBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover motion-safe:animate-kenburns"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-ink/25 via-accent-deep/10 to-ink/40"
      />

      <div className="relative w-full max-w-[420px]">
        <Card
          glass
          className="!rounded-full px-5 py-2.5 flex items-center justify-center gap-3 w-fit mx-auto mb-6"
        >
          <img src={breadMark} alt="" className="w-9 h-9" />
          <span className="font-display text-2xl">Bread</span>
        </Card>

        <Card glass className="px-7 py-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h1 className="font-display text-xl">{title}</h1>

            <Field label="Email">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">
              {submitting ? 'Please wait…' : buttonLabel}
            </Button>

            <Button
              variant="secondary"
              onClick={handleDemo}
              disabled={demoLoading}
              className="w-full !border-2 !border-ink/45 !bg-white/25 hover:!bg-white/40"
            >
              {demoLoading ? 'Starting demo…' : 'Try the demo'}
            </Button>

            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              onError={handleGoogleError}
            />

            <p className="text-sm text-ink-secondary text-center">
              {footer.text}{' '}
              <Link
                to={footer.to}
                className="text-accent rounded-full px-1 hover:underline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                {footer.linkLabel}
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default AuthForm

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { saveToken } from '../auth'
import { startDemo } from '../demo'
import Card from '../ui/Card'
import Button from '../ui/Button'
import BreadMark from '../ui/BreadMark'
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
    <div className="min-h-screen bg-page flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-3 mb-6">
          <BreadMark className="w-12 h-12 text-accent" scoreClassName="stroke-accent-100" />
          <span className="font-display text-2xl">Bread</span>
        </div>

        <Card className="px-7 py-7">
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

            {error && <p className="text-sm text-accent-deep">{error}</p>}

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">
              {submitting ? 'Please wait…' : buttonLabel}
            </Button>

            <Button
              variant="secondary"
              onClick={handleDemo}
              disabled={demoLoading}
              className="w-full"
            >
              {demoLoading ? 'Starting demo…' : 'Try the demo'}
            </Button>

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

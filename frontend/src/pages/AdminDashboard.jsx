import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { formatMoney } from '../currencies'
import { clearToken } from '../auth'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Label from '../ui/Label'
import { Table, Th, Td } from '../ui/Table'

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })
}

function StatCard({ label, value }) {
  return (
    <Card>
      <Label>{label}</Label>
      <p className="font-display text-[26px] leading-tight mt-[3px]">{value}</p>
    </Card>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    client
      .get('/admin/stats')
      .then((response) => setStats(response.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          clearToken()
          navigate('/login')
        } else {
          setError('Could not load admin stats')
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const base = stats?.baseCurrency ?? 'USD'

  return (
    <main className="px-4 sm:px-[30px] pt-3.5 pb-[34px] flex flex-col gap-4 h-full">
      {loading ? (
        <p className="text-ink-muted text-center">Loading…</p>
      ) : error ? (
        <p className="text-accent-deep text-center">{error}</p>
      ) : (
        <>
          <Button variant="ghost" className="self-start" onClick={() => navigate('/')}>
            ← Back to dashboard
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total users" value={stats.totals.userCount} />
            <StatCard label="Total expenses" value={stats.totals.expenseCount} />
            <StatCard label="Total spend" value={formatMoney(stats.totals.totalSpend, base)} />
            <StatCard label="Linked banks" value={stats.totals.bankCount} />
          </div>

          <Card className="flex flex-col gap-3.5 flex-1 min-h-0">
            <h2 className="font-display text-[22px]">Users</h2>
            {stats.users.length === 0 ? (
              <p className="text-sm text-ink-secondary">No users yet.</p>
            ) : (
              <div className="flex-1 min-h-0 overflow-auto">
                <Table className="min-w-[620px]">
                  <thead>
                    <tr>
                      <Th>Email</Th>
                      <Th>Signed up</Th>
                      <Th align="right">Expenses</Th>
                      <Th align="right">Banks</Th>
                      <Th align="right">Total spend</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.users.map((user) => (
                      <tr key={user.id}>
                        <Td>{user.email}</Td>
                        <Td className="text-ink-secondary">{formatDate(user.createdAt)}</Td>
                        <Td align="right" className="text-ink-secondary">
                          {user.expenseCount}
                        </Td>
                        <Td align="right" className="text-ink-secondary">
                          {user.bankCount}
                        </Td>
                        <Td align="right" className="font-semibold">
                          {formatMoney(user.totalSpend, base)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        </>
      )}
    </main>
  )
}

export default AdminDashboard

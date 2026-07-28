import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { formatMoney } from '../currencies'
import { clearToken } from '../auth'

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
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
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-700">Bread · Admin</h1>
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
          Back to dashboard
        </Link>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total users" value={stats.totals.userCount} />
              <StatCard label="Total expenses" value={stats.totals.expenseCount} />
              <StatCard label="Total spend" value={formatMoney(stats.totals.totalSpend, base)} />
              <StatCard label="Linked banks" value={stats.totals.bankCount} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Signed up</th>
                    <th className="px-6 py-3 font-medium">Expenses</th>
                    <th className="px-6 py-3 font-medium">Banks</th>
                    <th className="px-6 py-3 font-medium">Total spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-3 text-ink">{user.email}</td>
                      <td className="px-6 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-3 text-slate-500">{user.expenseCount}</td>
                      <td className="px-6 py-3 text-slate-500">{user.bankCount}</td>
                      <td className="px-6 py-3 text-ink">{formatMoney(user.totalSpend, base)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.users.length === 0 && (
                <p className="px-6 py-4 text-slate-500">No users yet.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard

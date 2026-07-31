import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { clearToken, isDemoSession } from '../auth'
import { resetDemo, endDemo } from '../demo'
import DemoBanner from '../components/DemoBanner'
import RateLimitBanner from '../components/RateLimitBanner'
import { onRateLimited } from '../rateLimit'
import Sidebar from './Sidebar'
import Header from './Header'

function AppLayout() {
  const [expenses, setExpenses] = useState([])
  const [accounts, setAccounts] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [budgets, setBudgets] = useState({})
  const [recurring, setRecurring] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [isDemo] = useState(isDemoSession())
  const [resetting, setResetting] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [navCollapsed, setNavCollapsed] = useState(
    () => localStorage.getItem('navCollapsed') === '1'
  )
  const [rateLimitNotice, setRateLimitNotice] = useState(null)
  const autoSyncStarted = useRef(false)
  const navigate = useNavigate()

  const closeNav = useCallback(() => setNavOpen(false), [])

  const clearRateLimitNotice = useCallback(() => setRateLimitNotice(null), [])

  useEffect(
    () =>
      onRateLimited(({ message, seconds }) => {
        const until = Date.now() + seconds * 1000
        setRateLimitNotice((current) =>
          current && current.until >= until ? current : { message, until }
        )
      }),
    []
  )

  const toggleNavCollapsed = useCallback(() => {
    setNavCollapsed((previous) => {
      localStorage.setItem('navCollapsed', previous ? '0' : '1')
      return !previous
    })
  }, [])

  useEffect(() => {
    if (!navOpen) return undefined
    function handleKey(event) {
      if (event.key === 'Escape') setNavOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 1024px)')
    function handleBreakpoint(event) {
      if (event.matches) setNavOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    desktop.addEventListener('change', handleBreakpoint)
    return () => {
      document.removeEventListener('keydown', handleKey)
      desktop.removeEventListener('change', handleBreakpoint)
    }
  }, [navOpen])

  const loadData = useCallback(async () => {
    try {
      const [
        meResponse,
        expensesResponse,
        accountsResponse,
        predictionResponse,
        anomaliesResponse,
        recurringResponse,
      ] = await Promise.all([
        client.get('/auth/me'),
        client.get('/expenses'),
        client.get('/accounts'),
        client.get('/insights/prediction').catch(() => null),
        client.get('/insights/anomalies').catch(() => null),
        client.get('/insights/recurring').catch(() => null),
      ])
      setBaseCurrency(meResponse.data.user.baseCurrency)
      setEmail(meResponse.data.user.email)
      setName(meResponse.data.user.name ?? '')
      setIsAdmin(meResponse.data.user.isAdmin ?? false)
      setBudgets(meResponse.data.user.budgets ?? {})
      setExpenses(expensesResponse.data.expenses)
      setAccounts(accountsResponse.data.accounts)
      setPrediction(predictionResponse?.data ?? { status: 'unavailable' })
      setAnomalies(anomaliesResponse?.data?.anomalies ?? [])
      setRecurring(recurringResponse?.data ?? { status: 'unavailable' })
    } catch (err) {
      if (err.response?.status === 401) {
        clearToken()
        navigate('/login')
      } else if (err.response?.data?.rateLimit) {
        setError(err.response.data.rateLimit.message)
      } else {
        setError('Could not load your data')
      }
    }
  }, [navigate])

  const syncThenReload = useCallback(async () => {
    setSyncing(true)
    try {
      await client.post('/plaid/sync')
      await loadData()
    } finally {
      setSyncing(false)
    }
  }, [loadData])

  useEffect(() => {
    loadData().finally(() => setLoading(false))
    if (autoSyncStarted.current || isDemo) return
    autoSyncStarted.current = true
    syncThenReload().catch(() => {})
  }, [loadData, syncThenReload])

  async function handleExpenseAdded(expense) {
    setExpenses((current) =>
      [expense, ...current].sort((a, b) => new Date(b.date) - new Date(a.date)),
    )
    try {
      const response = await client.get('/insights/anomalies')
      setAnomalies(response.data.anomalies ?? [])
    } catch {}
  }

  async function handleExpenseDeleted(id) {
    await client.delete(`/expenses/${id}`)
    setExpenses((current) => current.filter((expense) => expense._id !== id))
    try {
      const response = await client.get('/insights/anomalies')
      setAnomalies(response.data.anomalies ?? [])
    } catch {}
  }

  async function handleDismissAnomaly(id) {
    await client.post(`/expenses/${id}/dismiss-anomaly`)
    setAnomalies((current) => current.filter((anomaly) => anomaly.id !== id))
  }

  async function handleDismissAnomalies(ids) {
    await client.post('/expenses/dismiss-anomalies', { ids })
    const dismissed = new Set(ids)
    setAnomalies((current) => current.filter((anomaly) => !dismissed.has(anomaly.id)))
  }

  async function handleBudgetSet(category, amount) {
    const response = await client.put('/budgets', { category, amount })
    setBudgets(response.data.budgets)
  }

  async function handleBudgetRemoved(category) {
    const response = await client.delete(`/budgets/${encodeURIComponent(category)}`)
    setBudgets(response.data.budgets)
  }

  async function handleSync() {
    try {
      await syncThenReload()
    } catch {
      setError('Could not sync your accounts')
    }
  }

  async function handleAccountDisconnected(itemId) {
    await client.delete(`/plaid/items/${itemId}`)
    await loadData()
  }

  function handleReceiptChange(updatedExpense) {
    setExpenses((current) =>
      current.map((expense) =>
        expense._id === updatedExpense._id ? updatedExpense : expense,
      ),
    )
  }

  async function handleNameChange(next) {
    const previous = name
    setName(next)
    try {
      const response = await client.patch('/auth/me', { name: next })
      setName(response.data.user.name ?? '')
    } catch {
      setName(previous)
      setError('Could not save your name')
    }
  }

  async function handleBaseCurrencyChange(event) {
    const next = event.target.value
    setBaseCurrency(next)
    await client.patch('/auth/me', { baseCurrency: next })
    await loadData()
  }

  async function handleLogout() {
    if (isDemo) {
      try {
        await endDemo()
      } catch {}
    }
    clearToken()
    navigate('/login')
  }

  async function handleResetDemo() {
    setResetting(true)
    try {
      await resetDemo()
      await loadData()
    } catch {
      setError('Could not reset the demo')
    } finally {
      setResetting(false)
    }
  }

  const context = {
    expenses,
    accounts,
    prediction,
    anomalies,
    recurring,
    budgets,
    baseCurrency,
    email,
    name,
    isAdmin,
    isDemo,
    loading,
    error,
    syncing,
    onExpenseAdded: handleExpenseAdded,
    onExpenseDeleted: handleExpenseDeleted,
    onDismissAnomaly: handleDismissAnomaly,
    onDismissAnomalies: handleDismissAnomalies,
    onBudgetSet: handleBudgetSet,
    onBudgetRemoved: handleBudgetRemoved,
    onSync: handleSync,
    onAccountDisconnected: handleAccountDisconnected,
    onReceiptChange: handleReceiptChange,
    onNameChange: handleNameChange,
    reload: loadData,
  }

  return (
    <div className="h-screen overflow-hidden flex bg-page text-ink">
      <Sidebar
        expenses={expenses}
        budgets={budgets}
        baseCurrency={baseCurrency}
        open={navOpen}
        collapsed={navCollapsed}
        onClose={closeNav}
        onToggleCollapse={toggleNavCollapsed}
      />
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {rateLimitNotice && (
          <RateLimitBanner
            message={rateLimitNotice.message}
            until={rateLimitNotice.until}
            onExpire={clearRateLimitNotice}
          />
        )}
        {isDemo && <DemoBanner onReset={handleResetDemo} resetting={resetting} />}
        <Header
          baseCurrency={baseCurrency}
          onBaseCurrencyChange={handleBaseCurrencyChange}
          onLogout={handleLogout}
          isAdmin={isAdmin}
          onOpenNav={() => setNavOpen(true)}
          navOpen={navOpen}
        />
        <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable]">
          <Outlet context={context} />
        </div>
      </div>
    </div>
  )
}

export default AppLayout

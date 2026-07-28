import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import AddTransactionDialog from '../components/AddTransactionDialog'
import ExpenseList from '../components/ExpenseList'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Label from '../ui/Label'
import { currentMonthKey, filterByType, monthLabel, monthTotals } from '../breakdown'
import { formatMoney } from '../currencies'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expenses' },
  { value: 'income', label: 'Income' },
]

function Transactions() {
  const { loading, error, ...data } = useOutletContext()
  const {
    expenses,
    accounts,
    anomalies,
    recurring,
    baseCurrency,
    isDemo,
    onExpenseAdded,
    onExpenseDeleted,
    onReceiptChange,
  } = data

  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)

  const monthKey = currentMonthKey()
  const totals = monthTotals(expenses, monthKey)
  const anomalyIds = new Set(anomalies.map((anomaly) => anomaly.id))
  const recurringIds = new Set(
    (recurring?.series ?? []).flatMap((entry) => entry.expense_ids ?? [])
  )

  const depositAccounts = accounts.filter((account) => account.type === 'depository')
  const creditAccounts = accounts.filter((account) => account.type === 'credit')
  const bankBalance = depositAccounts.reduce(
    (sum, account) =>
      typeof account.convertedBalance === 'number' ? sum + account.convertedBalance : sum,
    0
  )
  const creditOwed = creditAccounts.reduce(
    (sum, account) =>
      typeof account.convertedBalance === 'number' ? sum + account.convertedBalance : sum,
    0
  )

  const shown = filterByType(expenses, filter)

  return (
    <main className="px-[30px] pt-3.5 pb-[34px] flex flex-col gap-4 h-full">
      {loading ? (
        <p className="text-ink-muted text-center">Loading…</p>
      ) : error ? (
        <p className="text-accent-deep text-center">{error}</p>
      ) : (
        <>
          <Button variant="ghost" className="self-start" onClick={() => navigate('/')}>
            ← Back to dashboard
          </Button>

          <div className="flex items-end gap-11 flex-wrap px-1 pb-[18px] border-b border-rule">
            <div>
              <Label>Bank balance</Label>
              <p className="font-display text-[40px] leading-tight mt-1.5">
                {formatMoney(bankBalance, baseCurrency)}
              </p>
              <p className="text-[12px] text-ink-muted mt-0.5">
                across {depositAccounts.length}{' '}
                {depositAccounts.length === 1 ? 'deposit account' : 'deposit accounts'}
              </p>
            </div>
            {creditAccounts.length > 0 && (
              <div>
                <Label>Credit owed</Label>
                <p className="font-display text-[40px] leading-tight mt-1.5 text-accent-deep">
                  {formatMoney(creditOwed, baseCurrency)}
                </p>
              </div>
            )}
            <div className="ml-auto flex gap-[34px]">
              <div>
                <Label>Income this month</Label>
                <p className="font-display text-[26px] mt-1 text-sage-deep">
                  {formatMoney(totals.income, baseCurrency)}
                </p>
              </div>
              <div>
                <Label>Expenses this month</Label>
                <p className="font-display text-[26px] mt-1">
                  {formatMoney(totals.spend, baseCurrency)}
                </p>
              </div>
              <div>
                <Label>Net</Label>
                <p className="font-display text-[26px] mt-1">
                  {formatMoney(totals.net, baseCurrency)}
                </p>
              </div>
            </div>
          </div>

          <Card className="flex-1 min-h-0 flex flex-col gap-3.5">
            <div className="flex items-center gap-3.5 flex-wrap">
              <h2 className="font-display text-[22px]">Expenses &amp; Income</h2>
              <div className="flex gap-2">
                {FILTERS.map((option) => (
                  <Button
                    key={option.value}
                    variant="secondary"
                    aria-pressed={filter === option.value}
                    onClick={() => setFilter(option.value)}
                    className={`border-transparent ${
                      filter === option.value ? 'bg-accent text-page' : 'bg-sand text-ink-nav'
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <Button variant="primary" className="ml-auto" onClick={() => setAddOpen(true)}>
                + Add transaction
              </Button>
            </div>
            <p className="text-sm text-ink-secondary">
              {shown.length} {shown.length === 1 ? 'transaction' : 'transactions'} ·{' '}
              {monthLabel(currentMonthKey())}
            </p>
            <div className="flex-1 min-h-0 overflow-auto">
              <ExpenseList
                expenses={expenses}
                filter={filter}
                accounts={accounts}
                baseCurrency={baseCurrency}
                onDelete={onExpenseDeleted}
                onReceiptChange={onReceiptChange}
                anomalyIds={anomalyIds}
                recurringIds={recurringIds}
                isDemo={isDemo}
              />
            </div>
          </Card>

          {addOpen && (
            <AddTransactionDialog
              open={addOpen}
              onClose={() => setAddOpen(false)}
              onAdded={onExpenseAdded}
              baseCurrency={baseCurrency}
            />
          )}
        </>
      )}
    </main>
  )
}

export default Transactions

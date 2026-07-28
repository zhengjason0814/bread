import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import AddExpenseForm from '../components/AddExpenseForm'
import ExpenseList from '../components/ExpenseList'
import AccountsPanel from '../components/AccountsPanel'
import PredictionCard from '../components/PredictionCard'
import AnomalyStrip from '../components/AnomalyStrip'
import GreetingRow from '../components/GreetingRow'
import CategoryDonut from '../components/CategoryDonut'
import SpendingTrendCard from '../components/SpendingTrendCard'
import BudgetsCard from '../components/BudgetsCard'
import BudgetAlertStrip from '../components/BudgetAlertStrip'
import RecurringCard from '../components/RecurringCard'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Tag from '../ui/Tag'
import { Table, Th, Td } from '../ui/Table'
import { categoryBreakdown, currentMonthKey, monthLabel, monthTotals } from '../breakdown'
import { categoryColor } from '../categoryColors'
import { formatMoney, formatSignedMoney } from '../currencies'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function Dashboard() {
  const { loading, error, ...data } = useOutletContext()
  const {
    email,
    expenses,
    accounts,
    prediction,
    anomalies,
    recurring,
    budgets,
    baseCurrency,
    isDemo,
    syncing,
    onExpenseAdded,
    onExpenseDeleted,
    onDismissAnomaly,
    onBudgetSet,
    onBudgetRemoved,
    onSync,
    onAccountDisconnected,
    onReceiptChange,
    reload,
  } = data

  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)

  const monthKey = currentMonthKey()
  const { total, slices } = categoryBreakdown(expenses, monthKey)
  const totals = monthTotals(expenses, monthKey)
  const recentExpenses = expenses.slice(0, 10)
  const anomalyIds = new Set(anomalies.map((anomaly) => anomaly.id))
  const recurringIds = new Set(
    (recurring?.series ?? []).flatMap((entry) => entry.expense_ids ?? [])
  )

  function handleExpenseAdded(expense) {
    onExpenseAdded(expense)
    setAddOpen(false)
  }

  return (
    <main className="px-[30px] pt-5 pb-[34px] flex flex-col gap-6">
      {loading ? (
        <p className="text-ink-muted text-center">Loading…</p>
      ) : error ? (
        <p className="text-accent-deep text-center">{error}</p>
      ) : (
        <>
          <GreetingRow
            accounts={accounts}
            expenses={expenses}
            budgets={budgets}
            baseCurrency={baseCurrency}
            email={email}
          />
          <div className="grid grid-cols-[minmax(320px,0.8fr)_1.2fr] gap-5 pb-6 border-b border-rule items-stretch">
            <Card
              interactive
              onClick={() => navigate('/charts')}
              className="flex flex-col gap-3.5"
            >
              <div className="flex items-baseline gap-2.5">
                <h2 className="font-display text-[19px]">Spending this month</h2>
                <span className="text-[13px] text-accent-link ml-auto">Full breakdown →</span>
              </div>
              {slices.length === 0 ? (
                <p className="text-sm text-ink-muted">No spending recorded this month yet.</p>
              ) : (
                <div className="flex items-center gap-[22px]">
                  <CategoryDonut
                    slices={slices}
                    total={total}
                    size={142}
                    centerLabel={monthLabel(monthKey)}
                    baseCurrency={baseCurrency}
                  />
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {slices.map((slice) => (
                      <div key={slice.name} className="flex items-center gap-2 text-[13px]">
                        <span
                          className="w-[11px] h-[11px] rounded-full flex-none"
                          style={{ backgroundColor: categoryColor(slice.name).solid }}
                        />
                        <span className="flex-1 truncate">{slice.name}</span>
                        <span className="text-ink-secondary">
                          {Math.round((slice.amount / total) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div className="relative min-h-[240px]">
              <Card className="absolute inset-0 flex flex-col">
                <div className="flex items-center flex-wrap gap-x-3 gap-y-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/transactions')}
                    className="font-display text-[19px] text-left cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                  >
                    Expenses &amp; Income
                  </button>
                  <span className="text-[13px] text-ink-secondary">
                    Net {formatMoney(totals.net, baseCurrency)}
                  </span>
                  <Button variant="primary" className="ml-auto" onClick={() => setAddOpen(true)}>
                    + Add transaction
                  </Button>
                </div>
                <div className="mt-2.5 flex-1 min-h-0 overflow-auto">
                  <Table>
                    <thead>
                      <tr>
                        <Th>Date</Th>
                        <Th>Category</Th>
                        <Th>Note</Th>
                        <Th align="right">Amount</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map((expense) => (
                        <tr key={expense._id}>
                          <Td className="whitespace-nowrap text-ink-secondary">
                            {formatDate(expense.date)}
                          </Td>
                          <Td>
                            <Tag variant="category" category={expense.category}>
                              {expense.category}
                            </Tag>
                            {recurringIds.has(expense._id) && (
                              <Tag variant="outline" className="ml-1.5">
                                Recurring
                              </Tag>
                            )}
                            {anomalyIds.has(expense._id) && (
                              <Tag variant="outline" className="ml-1.5">
                                Unusual
                              </Tag>
                            )}
                          </Td>
                          <Td className="text-ink-secondary truncate max-w-[220px]">
                            {expense.note}
                          </Td>
                          <Td
                            align="right"
                            className={`whitespace-nowrap font-medium ${
                              expense.type === 'income' ? 'text-sage-deep' : ''
                            }`}
                          >
                            {typeof expense.convertedAmount === 'number'
                              ? formatSignedMoney(expense.convertedAmount, baseCurrency, expense.type)
                              : '—'}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card>
            </div>
          </div>
          {addOpen && <AddExpenseForm onAdded={handleExpenseAdded} baseCurrency={baseCurrency} />}
          <AccountsPanel
            accounts={accounts}
            onConnected={reload}
            onSync={onSync}
            onDisconnect={onAccountDisconnected}
            syncing={syncing}
            isDemo={isDemo}
          />
          <AnomalyStrip
            anomalies={anomalies}
            baseCurrency={baseCurrency}
            onDismiss={onDismissAnomaly}
          />
          <BudgetAlertStrip expenses={expenses} budgets={budgets} baseCurrency={baseCurrency} />
          <PredictionCard prediction={prediction} baseCurrency={baseCurrency} />
          <SpendingTrendCard expenses={expenses} baseCurrency={baseCurrency} />
          <BudgetsCard
            expenses={expenses}
            baseCurrency={baseCurrency}
            budgets={budgets}
            onSet={onBudgetSet}
            onRemove={onBudgetRemoved}
          />
          <RecurringCard recurring={recurring} baseCurrency={baseCurrency} />
          <ExpenseList
            expenses={expenses}
            baseCurrency={baseCurrency}
            onDelete={onExpenseDeleted}
            onReceiptChange={onReceiptChange}
            anomalyIds={anomalyIds}
            recurringIds={recurringIds}
            isDemo={isDemo}
          />
        </>
      )}
    </main>
  )
}

export default Dashboard

import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import AddTransactionDialog from '../components/AddTransactionDialog'
import ConnectBank from '../components/ConnectBank'
import GreetingRow from '../components/GreetingRow'
import CategoryDonut from '../components/CategoryDonut'
import MonthBars from '../components/MonthBars'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Tag from '../ui/Tag'
import Label from '../ui/Label'
import { Table, Th, Td } from '../ui/Table'
import { categoryBreakdown, currentMonthKey, monthLabel, monthTotals } from '../breakdown'
import { categoryColor } from '../categoryColors'
import { formatMoney, formatSignedMoney } from '../currencies'
import { budgetStatuses } from '../budgets'
import { monthlyTotals } from '../trend'
import { formatNextDate, recurringMonthlyTotal } from '../recurring'

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
    onExpenseAdded,
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
  const budgetList = budgetStatuses(expenses, budgets)

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
          {addOpen && (
            <AddTransactionDialog
              open={addOpen}
              onClose={() => setAddOpen(false)}
              onAdded={onExpenseAdded}
              baseCurrency={baseCurrency}
            />
          )}

          <div className="grid grid-cols-3 gap-5 items-start">
            <Card
              interactive
              onClick={() => navigate('/accounts')}
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-[18px]">Accounts</h2>
                <Tag variant="sage" className="ml-auto">
                  {accounts.length} linked
                </Tag>
                <ConnectBank onConnected={reload} />
              </div>
              {accounts.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  No linked accounts yet. Connect a bank to import transactions automatically.
                </p>
              ) : (
                <div className="flex flex-col gap-[7px] text-[13px] mt-1">
                  {accounts.slice(0, 4).map((account) => (
                    <div key={account._id} className="flex items-center gap-2.5">
                      <span className="font-semibold truncate">{account.name}</span>
                      {account.mask && (
                        <span className="text-ink-faint">••{account.mask}</span>
                      )}
                      <span className="ml-auto">
                        {typeof account.convertedBalance === 'number'
                          ? formatMoney(account.convertedBalance, baseCurrency)
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              interactive
              onClick={() => navigate('/charts')}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-[18px]">Monthly spend</h2>
                <span className="ml-auto text-[12px] text-accent-link">6 months →</span>
              </div>
              <MonthBars months={monthlyTotals(expenses, 6).slice(-3)} height={150} />
            </Card>

            <Card
              interactive
              onClick={() => navigate('/budgets')}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-[18px]">Budgets</h2>
                <span className="ml-auto text-[12px] text-accent-link">Set budget →</span>
              </div>
              {budgetList.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  Set a monthly budget per category to track your spending against it.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {budgetList.slice(0, 3).map((status) => (
                    <div key={status.category} className="flex flex-col gap-[5px]">
                      <div className="flex items-center text-[13px]">
                        <span className="font-semibold">{status.category}</span>
                        {status.level === 'over' && (
                          <Tag
                            variant="accent"
                            className="ml-2 bg-accent-200 text-accent-deep"
                          >
                            over budget
                          </Tag>
                        )}
                        <span className="ml-auto text-ink-secondary">
                          {formatMoney(status.spent, baseCurrency)} /{' '}
                          {formatMoney(status.limit, baseCurrency)}
                        </span>
                      </div>
                      <div className="h-[9px] rounded-full bg-track overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status.level === 'over' ? 'bg-accent' : 'bg-sage'
                          }`}
                          style={{ width: `${Math.min(status.ratio, 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              interactive
              onClick={() => navigate('/recurring')}
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-[18px]">Recurring</h2>
                <span className="ml-auto text-[12px] text-accent-link">
                  All subscriptions →
                </span>
              </div>
              {!recurring || recurring.status !== 'ok' ? (
                <p className="text-sm text-ink-muted">
                  Recurring expense detection is unavailable right now.
                </p>
              ) : recurring.series.length === 0 ? (
                <p className="text-sm text-ink-muted">No recurring expenses detected yet.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-2.5 text-[13px]">
                    {recurring.series.slice(0, 3).map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2.5">
                        <span className="font-semibold truncate">{entry.name}</span>
                        <span className="text-ink-faint">{entry.cadence}</span>
                        <span className="ml-auto">
                          ~{formatMoney(entry.typical_amount, baseCurrency)}
                        </span>
                        <span className="text-ink-faint w-[78px] text-right">
                          next {formatNextDate(entry.next_expected)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] text-ink-secondary mt-1">
                    ≈{' '}
                    <strong className="font-semibold text-ink">
                      {formatMoney(recurringMonthlyTotal(recurring.series), baseCurrency)}
                    </strong>
                    /month in recurring spend
                  </p>
                </>
              )}
            </Card>

            <Card
              interactive
              onClick={() => navigate('/charts')}
              className="flex flex-col gap-2.5"
            >
              <h2 className="font-display text-[18px]">Spending outlook</h2>
              {!prediction || prediction.status === 'unavailable' ? (
                <p className="text-sm text-ink-muted">
                  Spending predictions are unavailable right now.
                </p>
              ) : prediction.status === 'insufficient_data' ? (
                <p className="text-sm text-ink-muted">
                  Keep adding expenses — predictions unlock after 3 full months of history.
                </p>
              ) : (
                <>
                  <div className="flex gap-[26px] mt-1">
                    <div>
                      <Label>This month</Label>
                      <p className="font-display text-[22px] mt-[3px]">
                        {formatMoney(prediction.current_month.spent_so_far, baseCurrency)}
                      </p>
                      <p className="text-[12px] text-ink-muted">spent so far</p>
                    </div>
                    <div>
                      <Label>Next month</Label>
                      <p className="font-display text-[22px] mt-[3px]">
                        {formatMoney(prediction.next_month.low, baseCurrency)} –{' '}
                        {formatMoney(prediction.next_month.high, baseCurrency)}
                      </p>
                      <p className="text-[12px] text-ink-muted">based on your history</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-ink-faint mt-1.5">
                    Predictions sharpen as more history builds up.
                  </p>
                </>
              )}
            </Card>

            <Card
              interactive
              onClick={() => navigate('/anomalies')}
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-[18px]">Anomalies</h2>
                <Tag variant="accent" className="ml-auto bg-accent-200 text-accent-deep">
                  {anomalies.length} new
                </Tag>
              </div>
              {anomalies.length === 0 ? (
                <p className="text-sm text-ink-muted">No unusual charges detected.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {anomalies.slice(0, 2).map((anomaly) => {
                    const note =
                      expenses.find((expense) => expense._id === anomaly.id)?.note ??
                      anomaly.category
                    const multiple =
                      anomaly.typical_high > 0
                        ? (anomaly.amount / anomaly.typical_high).toFixed(1)
                        : null
                    const description = multiple
                      ? `${note} — ${multiple}× your usual ${anomaly.category} charge`
                      : `${note} — unusual for ${anomaly.category}`
                    return (
                      <div key={anomaly.id} className="flex items-center gap-3 text-[13px]">
                        <span
                          className="w-[9px] h-[9px] rounded-full flex-none"
                          style={{ backgroundColor: categoryColor(anomaly.category).solid }}
                        />
                        <span className="flex-1 truncate">{description}</span>
                        <span className="font-semibold">
                          {formatMoney(anomaly.amount, baseCurrency)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </main>
  )
}

export default Dashboard

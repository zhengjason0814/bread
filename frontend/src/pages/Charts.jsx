import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import CategoryDonut from '../components/CategoryDonut'
import MonthBars from '../components/MonthBars'
import Card from '../ui/Card'
import Button from '../ui/Button'
import {
  categoryBreakdown,
  currentMonthKey,
  earliestSpendMonthKey,
  monthLabel,
  shiftMonthKey,
} from '../breakdown'
import { monthlyTotals, samePointDelta } from '../trend'
import { categoryColor } from '../categoryColors'
import { formatMoney } from '../currencies'

function monthName(monthKey) {
  return monthLabel(monthKey).split(' ')[0]
}

function DeltaHeadline({ delta }) {
  if (!delta) return null
  const previousName = monthName(delta.previousMonthKey)
  if (delta.direction === 'flat') {
    return (
      <p className="text-sm text-ink-secondary">
        even with {previousName} (through day {delta.day})
      </p>
    )
  }
  return (
    <p className="text-sm text-ink-secondary">
      <span className={delta.direction === 'up' ? 'text-accent-deep' : 'text-sage-deep'}>
        {delta.direction === 'up' ? '↑' : '↓'}
      </span>{' '}
      <span className="font-medium text-ink">{delta.percent}%</span> vs {previousName} (through
      day {delta.day})
    </p>
  )
}

function Charts() {
  const { loading, error, ...data } = useOutletContext()
  const { expenses, baseCurrency } = data
  const navigate = useNavigate()
  const [monthKey, setMonthKey] = useState(currentMonthKey())

  const { total, slices } = categoryBreakdown(expenses, monthKey)
  const atCurrentMonth = monthKey === currentMonthKey()
  const earliestMonthKey = earliestSpendMonthKey(expenses)
  const atEarliestMonth = !earliestMonthKey || monthKey <= earliestMonthKey

  const months = monthlyTotals(expenses, 6)
  const delta = samePointDelta(expenses)
  const average =
    months.length > 0
      ? months.reduce((sum, month) => sum + month.total, 0) / months.length
      : 0

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

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[22px]" aria-live="polite">
                By category — {monthLabel(monthKey)}
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  onClick={() => setMonthKey(shiftMonthKey(monthKey, -1))}
                  disabled={atEarliestMonth}
                  aria-label="Previous month"
                >
                  ‹
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setMonthKey(shiftMonthKey(monthKey, 1))}
                  disabled={atCurrentMonth}
                  aria-label="Next month"
                >
                  ›
                </Button>
              </div>
            </div>
            {slices.length === 0 ? (
              <p className="text-sm text-ink-secondary">No spending in this month.</p>
            ) : (
              <div className="flex items-center gap-7">
                <CategoryDonut
                  slices={slices}
                  total={total}
                  size={230}
                  centerLabel="total spend"
                  baseCurrency={baseCurrency}
                />
                <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                  {slices.map((slice) => (
                    <div key={slice.name} className="flex items-center gap-2.5 text-sm">
                      <span
                        className="w-3 h-3 rounded-full flex-none"
                        style={{ backgroundColor: categoryColor(slice.name).solid }}
                      />
                      <span
                        className="flex-1 min-w-0 truncate"
                        title={
                          slice.categories.length > 1
                            ? `${slice.name} (${slice.categories.join(', ')})`
                            : undefined
                        }
                      >
                        {slice.name}
                        {slice.categories.length > 1 && (
                          <span className="ml-1.5 text-xs text-ink-faint">
                            ({slice.categories.join(', ')})
                          </span>
                        )}
                      </span>
                      <span className="text-ink-secondary whitespace-nowrap">
                        {formatMoney(slice.amount, baseCurrency)}
                      </span>
                      <span className="w-11 text-right text-ink-faint">
                        {Math.round((slice.amount / total) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-[22px]">Month over month</h2>
            <MonthBars months={months} height={260} baseCurrency={baseCurrency} />
            {delta ? (
              <DeltaHeadline delta={delta} />
            ) : (
              <p className="text-sm text-ink-secondary">
                Your trend appears once you have a previous month to compare.
              </p>
            )}
            <p className="text-sm text-ink-secondary">
              Average {formatMoney(average, baseCurrency)} a month over the last six months.
            </p>
          </Card>
        </>
      )}
    </main>
  )
}

export default Charts

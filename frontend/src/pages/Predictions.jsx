import { useNavigate, useOutletContext } from 'react-router-dom'
import MonthBars from '../components/MonthBars'
import PagePeek from '../components/PagePeek'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Label from '../ui/Label'
import { currentMonthKey, monthLabel, shiftMonthKey } from '../breakdown'
import { monthlyTotals } from '../trend'
import { formatMoney } from '../currencies'
import { PredictionsSkeleton } from '../components/Skeletons'

const WARM_UP_NOTE = 'Predictions sharpen as more history builds up.'
const MONTHS_OF_HISTORY = 6

function Predictions() {
  const { loading, error, ...data } = useOutletContext()
  const { prediction, expenses, baseCurrency } = data
  const navigate = useNavigate()

  const unavailable = !prediction || prediction.status === 'unavailable'
  const ready = !unavailable && prediction.status === 'ok'

  const thisMonthKey = currentMonthKey()
  const nextMonthKey = shiftMonthKey(thisMonthKey, 1)
  const months = monthlyTotals(expenses, MONTHS_OF_HISTORY)
  const forecast = ready
    ? {
        monthKey: nextMonthKey,
        low: prediction.next_month.low,
        high: prediction.next_month.high,
      }
    : null

  return (
    <main className="px-4 sm:px-[30px] pt-3.5 pb-12 flex flex-col gap-4 min-h-full">
      {loading ? (
        <PredictionsSkeleton />
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : (
        <>
          <Button variant="ghost" className="self-start" onClick={() => navigate('/')}>
            ← Back to dashboard
          </Button>

          <Card className="relative mt-2 sm:mt-4 flex flex-col gap-3.5">
            <PagePeek />
            <h2 className="font-display text-[19px] sm:text-[22px]">Spending outlook</h2>
            <p className="text-sm text-ink-secondary">
              What you have spent this month, and what next month is likely to cost.
            </p>
            {unavailable ? (
              <p className="text-sm text-ink-secondary mt-1">
                Spending predictions are unavailable right now.
              </p>
            ) : !ready ? (
              <p className="text-sm text-ink-secondary mt-1">
                Keep adding expenses — predictions unlock after 3 full months of history.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-x-16 gap-y-5 mt-1">
                  <div>
                    <Label>This month</Label>
                    <p className="font-display text-[30px] sm:text-[34px] mt-1">
                      {formatMoney(prediction.current_month.spent_so_far, baseCurrency)}
                    </p>
                    <p className="text-[12px] text-ink-muted">
                      spent so far in {monthLabel(thisMonthKey)}
                    </p>
                  </div>
                  <div>
                    <Label>Next month</Label>
                    <p className="font-display text-[30px] sm:text-[34px] mt-1">
                      {formatMoney(prediction.next_month.low, baseCurrency)} –{' '}
                      {formatMoney(prediction.next_month.high, baseCurrency)}
                    </p>
                    <p className="text-[12px] text-ink-muted">
                      the middle range {monthLabel(nextMonthKey)} is likely to land in
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-ink-faint mt-1">{WARM_UP_NOTE}</p>
              </>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-[19px] sm:text-[22px]">History and forecast</h2>
            <MonthBars
              months={months}
              forecast={forecast}
              height={260}
              baseCurrency={baseCurrency}
            />
            {ready ? (
              <p className="text-sm text-ink-secondary">
                {monthLabel(thisMonthKey)} is still in progress, so its bar counts only what you
                have spent so far. The outlined block spans the middle range next month is likely to
                fall in, rather than a single guess.
              </p>
            ) : (
              <p className="text-sm text-ink-secondary">
                Your spending over the last {MONTHS_OF_HISTORY} months.
              </p>
            )}
          </Card>
        </>
      )}
    </main>
  )
}

export default Predictions

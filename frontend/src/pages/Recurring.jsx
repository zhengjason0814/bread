import { useOutletContext } from 'react-router-dom'
import ListPage, { ListRow } from '../components/ListPage'
import { formatMoney } from '../currencies'
import { formatNextDate, recurringMonthlyTotal } from '../recurring'
import { ListRowsSkeleton } from '../components/Skeletons'

const WARM_UP_NOTE = "New subscriptions can take a few months of history before they're detected."

function Recurring() {
  const { loading, error, ...data } = useOutletContext()
  const { recurring, baseCurrency } = data

  const unavailable = !recurring || recurring.status === 'unavailable'
  const series = !unavailable && recurring.status === 'ok' ? recurring.series : []
  const monthlyTotal = recurringMonthlyTotal(series)

  return (
    <ListPage
      title="Recurring"
      blurb="Subscriptions and memberships detected in your history."
    >
      {loading ? (
        <ListRowsSkeleton />
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : unavailable ? (
        <>
          <p className="text-sm text-ink-secondary">
            Recurring expense detection is unavailable right now.
          </p>
          <p className="text-xs text-ink-faint mt-2">{WARM_UP_NOTE}</p>
        </>
      ) : series.length === 0 ? (
        <>
          <p className="text-sm text-ink-secondary">No recurring expenses detected yet.</p>
          <p className="text-xs text-ink-faint mt-2">{WARM_UP_NOTE}</p>
        </>
      ) : (
        <>
          {series.map((entry) => (
            <ListRow
              key={entry.name}
              primary={entry.name}
              description={`${entry.cadence} · next ${formatNextDate(entry.next_expected)}`}
              amount={`~${formatMoney(entry.typical_amount, baseCurrency)}`}
            />
          ))}
          <p className="text-sm text-ink-secondary mt-3">
            ≈{' '}
            <span className="font-semibold text-ink">
              {formatMoney(monthlyTotal, baseCurrency)}
            </span>
            /month in recurring spend
          </p>
          <p className="text-xs text-ink-faint mt-2">{WARM_UP_NOTE}</p>
        </>
      )}
    </ListPage>
  )
}

export default Recurring

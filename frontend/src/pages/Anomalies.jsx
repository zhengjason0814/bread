import { useOutletContext } from 'react-router-dom'
import ListPage, { ListRow } from '../components/ListPage'
import Button from '../ui/Button'
import { formatMoney } from '../currencies'
import { ListRowsSkeleton } from '../components/Skeletons'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function Anomalies() {
  const { loading, error, ...data } = useOutletContext()
  const { anomalies, expenses, baseCurrency, onDismissAnomaly } = data

  return (
    <ListPage
      title="Anomalies"
      blurb="Charges that broke from your usual pattern this month."
    >
      {loading ? (
        <ListRowsSkeleton />
      ) : error ? (
        <p className="text-accent-deep text-center">{error}</p>
      ) : anomalies.length === 0 ? (
        <p className="text-sm text-ink-secondary">No unusual charges detected.</p>
      ) : (
        anomalies.map((anomaly) => {
          const expense = expenses.find((item) => item._id === anomaly.id)
          const label = expense?.note ?? anomaly.category
          const comparison = `vs your typical ${formatMoney(
            anomaly.typical_low,
            baseCurrency
          )}–${formatMoney(anomaly.typical_high, baseCurrency)} for ${anomaly.category}`
          const description = expense ? `${formatDate(expense.date)} · ${comparison}` : comparison

          return (
            <ListRow
              key={anomaly.id}
              primary={label}
              description={description}
              amount={formatMoney(anomaly.amount, baseCurrency)}
              trailing={
                <Button variant="ghost" onClick={() => onDismissAnomaly(anomaly.id)}>
                  Dismiss
                </Button>
              }
            />
          )
        })
      )}
    </ListPage>
  )
}

export default Anomalies

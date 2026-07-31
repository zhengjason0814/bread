import { useState } from 'react'
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
  const { anomalies, expenses, baseCurrency, onDismissAnomaly, onDismissAnomalies } = data
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const allSelected = anomalies.length > 0 && anomalies.every((a) => selectedIds.has(a.id))

  function toggleOne(id) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(anomalies.map((a) => a.id)))
  }

  async function handleDismissSelected() {
    const ids = Array.from(selectedIds)
    await onDismissAnomalies(ids)
    setSelectedIds(new Set())
  }

  return (
    <ListPage
      title="Anomalies"
      blurb="Charges that broke from your usual pattern this month."
      actions={
        !loading &&
        !error &&
        anomalies.length > 0 && (
          <>
            <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
              <input
                type="checkbox"
                className="accent-accent"
                checked={allSelected}
                onChange={toggleAll}
              />
              Select all
            </label>
            <Button
              variant="secondary"
              disabled={selectedIds.size === 0}
              onClick={handleDismissSelected}
            >
              Dismiss selected{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
            </Button>
          </>
        )
      }
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
              leading={
                <input
                  type="checkbox"
                  className="accent-accent"
                  checked={selectedIds.has(anomaly.id)}
                  onChange={() => toggleOne(anomaly.id)}
                />
              }
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

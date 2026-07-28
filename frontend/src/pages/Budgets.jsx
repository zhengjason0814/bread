import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ListPage from '../components/ListPage'
import Button from '../ui/Button'
import Tag from '../ui/Tag'
import { Input, Select } from '../ui/Field'
import { budgetBarClass, budgetStatuses } from '../budgets'
import { BUDGETABLE_CATEGORIES } from '../categories'
import { formatMoney } from '../currencies'

function BudgetRow({ status, baseCurrency, onSet, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(status.limit))
  const escapeCancelled = useRef(false)

  async function save() {
    if (escapeCancelled.current) {
      escapeCancelled.current = false
      return
    }
    const amount = Number(draft)
    setEditing(false)
    if (Number.isFinite(amount) && amount > 0 && amount !== status.limit) {
      try {
        await onSet(status.category, amount)
      } catch {
        setDraft(String(status.limit))
      }
    } else {
      setDraft(String(status.limit))
    }
  }

  function startEditing() {
    escapeCancelled.current = false
    setDraft(String(status.limit))
    setEditing(true)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') event.target.blur()
    if (event.key === 'Escape') {
      escapeCancelled.current = true
      setDraft(String(status.limit))
      setEditing(false)
    }
  }

  const percent = Math.round(status.ratio * 100)

  return (
    <div className="flex flex-col gap-2 py-[13px] border-b border-rule-soft text-sm">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        <span className="font-semibold w-full sm:w-auto sm:min-w-[190px] flex items-center gap-2">
          {status.category}
          {status.level === 'over' && (
            <Tag variant="accent" className="bg-accent-200 text-accent-deep">
              over budget
            </Tag>
          )}
          {status.level === 'warn' && <Tag variant="accent">close to limit</Tag>}
        </span>
        <span className="text-ink-muted flex-1 min-w-0">
          {percent}% of a{' '}
          {editing ? (
            <Input
              type="number"
              min="1"
              value={draft}
              autoFocus
              onChange={(event) => setDraft(event.target.value)}
              onBlur={save}
              onKeyDown={handleKeyDown}
              aria-label={`${status.category} monthly limit`}
              className="inline-block w-24 align-middle"
            />
          ) : (
            <button
              type="button"
              onClick={startEditing}
              aria-label={`Edit ${status.category} budget limit`}
              className="underline decoration-dotted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
            >
              {formatMoney(status.limit, baseCurrency)}
            </button>
          )}{' '}
          limit
        </span>
        <span className="font-semibold">{formatMoney(status.spent, baseCurrency)}</span>
        <Button
          variant="ghost"
          onClick={() => onRemove(status.category).catch(() => {})}
          aria-label={`Remove ${status.category} budget`}
        >
          Remove
        </Button>
      </div>
      <div className="h-2 rounded-full bg-track overflow-hidden" aria-hidden="true">
        <div
          className={`h-full rounded-full ${budgetBarClass(status.ratio)}`}
          style={{ width: `${Math.min(status.ratio, 1) * 100}%` }}
        />
      </div>
    </div>
  )
}

function AddBudgetForm({ available, onSet, onDone }) {
  const [category, setCategory] = useState(available[0] || '')
  const [amount, setAmount] = useState('')

  async function submit(event) {
    event.preventDefault()
    const value = Number(amount)
    if (!category || !Number.isFinite(value) || value <= 0) return
    try {
      await onSet(category, value)
      onDone()
    } catch {}
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 pb-[13px] border-b border-rule-soft">
      <Select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        aria-label="Budget category"
        className="w-auto"
      >
        {available.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <Input
        type="number"
        min="1"
        placeholder="Monthly limit"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        aria-label="Monthly limit amount"
        className="w-36"
      />
      <Button variant="primary" type="submit">
        Save
      </Button>
      <Button variant="ghost" onClick={onDone}>
        Cancel
      </Button>
    </form>
  )
}

function Budgets() {
  const { loading, error, ...data } = useOutletContext()
  const { expenses, baseCurrency, budgets, onBudgetSet, onBudgetRemoved } = data
  const [adding, setAdding] = useState(false)

  const statuses = budgetStatuses(expenses, budgets)
  const available = BUDGETABLE_CATEGORIES.filter((name) => !(budgets && name in budgets))

  return (
    <ListPage
      title="Budgets"
      blurb="Monthly limits you set, measured against what you have spent."
      actions={
        !adding &&
        available.length > 0 && (
          <Button variant="primary" onClick={() => setAdding(true)}>
            + Set budget
          </Button>
        )
      }
    >
      {loading ? (
        <p className="text-ink-muted text-center">Loading…</p>
      ) : error ? (
        <p className="text-accent-deep text-center">{error}</p>
      ) : (
        <>
          {adding && (
            <AddBudgetForm available={available} onSet={onBudgetSet} onDone={() => setAdding(false)} />
          )}
          {statuses.length === 0 ? (
            !adding && (
              <p className="text-sm text-ink-secondary">
                Set a monthly budget per category to track your spending against it.
              </p>
            )
          ) : (
            statuses.map((status) => (
              <BudgetRow
                key={status.category}
                status={status}
                baseCurrency={baseCurrency}
                onSet={onBudgetSet}
                onRemove={onBudgetRemoved}
              />
            ))
          )}
        </>
      )}
    </ListPage>
  )
}

export default Budgets

import { useState } from 'react'
import Dialog from '../ui/Dialog'
import { Input, Field } from '../ui/Field'
import Button from '../ui/Button'
import { formatMoney } from '../currencies'
import { splitExpense, unsplitExpense } from '../splits'

function SplitExpenseDialog({ expense, onClose, onChange }) {
  const total = expense.isShared ? expense.sharedTotal : expense.amount
  const [share, setShare] = useState(expense.isShared ? String(expense.amount) : '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const numericShare = Number(share)
    if (!Number.isFinite(numericShare) || numericShare <= 0) {
      return 'Enter an amount greater than 0'
    }
    if (numericShare > total) {
      return `Your share can't be more than the total (${formatMoney(total, expense.currency)})`
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const updated = await splitExpense(expense._id, Number(share))
      onChange(updated)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Could not split this expense')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemoveSplit() {
    setSubmitting(true)
    try {
      const updated = await unsplitExpense(expense._id)
      onChange(updated)
      onClose()
    } catch {
      setError('Could not remove the split')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onClose={onClose} title="Split expense">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <p className="text-sm text-ink-secondary">
          Total: <span className="font-semibold text-ink">{formatMoney(total, expense.currency)}</span>
          {' — how much of this is actually yours?'}
        </p>
        <Field label="Your share" error={error}>
          <Input
            inputMode="decimal"
            placeholder="0.00"
            value={share}
            onChange={(event) => {
              setShare(event.target.value)
              setError('')
            }}
          />
        </Field>
        <div className="flex justify-end gap-2.5">
          {expense.isShared && (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto"
              disabled={submitting}
              onClick={handleRemoveSplit}
            >
              Remove split
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save split'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default SplitExpenseDialog

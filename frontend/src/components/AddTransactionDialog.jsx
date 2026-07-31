import { useEffect, useRef, useState } from 'react'
import client from '../api/client'
import { CURRENCIES } from '../currencies'
import { CATEGORIES, isNoneLikeNote } from '../categories'
import { ACCEPTED_RECEIPT_TYPES, receiptTypeError, uploadReceipt } from '../receipts'
import { localTodayISO, isFutureDate } from '../dates'
import Dialog from '../ui/Dialog'
import Segmented from '../ui/Segmented'
import { Input, Select, Field } from '../ui/Field'
import Button from '../ui/Button'

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
]

function AddTransactionDialog({ open, onClose, onAdded, baseCurrency }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(baseCurrency)
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(localTodayISO())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [receiptFile, setReceiptFile] = useState(null)
  const receiptInputRef = useRef(null)

  useEffect(() => {
    if (!note.trim() || category) {
      setSuggestion(null)
      return
    }
    if (isNoneLikeNote(note)) {
      setSuggestion({ category: 'Other' })
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const response = await client.get('/insights/suggest-category', {
          params: { text: note },
        })
        if (!cancelled) {
          setSuggestion(response.data.status === 'ok' ? response.data : null)
        }
      } catch {
        if (!cancelled) {
          setSuggestion(null)
        }
      }
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [note, category])

  function resetForm() {
    setType('expense')
    setAmount('')
    setCurrency(baseCurrency)
    setCategory('')
    setDate(localTodayISO())
    setNote('')
    setReceiptFile(null)
    if (receiptInputRef.current) {
      receiptInputRef.current.value = ''
    }
    setSuggestion(null)
    setFieldErrors({})
  }

  function handleClose() {
    onClose()
  }

  function handleFile(event) {
    const file = event.target.files?.[0] ?? null
    if (file) {
      const message = receiptTypeError(file)
      if (message) {
        setError(message)
        setReceiptFile(null)
        event.target.value = ''
        return
      }
    }
    setError('')
    setReceiptFile(file)
  }

  function clearFieldError(key) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function validate() {
    const errors = {}
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      errors.amount = 'Enter an amount greater than 0'
    }
    if (!category) {
      errors.category = 'Select a category'
    }
    if (date && isFutureDate(date)) {
      errors.date = 'Date cannot be in the future'
    }
    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    setSubmitting(true)
    try {
      const response = await client.post('/expenses', {
        amount: Number(amount),
        currency,
        category,
        date,
        note,
        type,
      })
      let finalExpense = response.data.expense
      let receiptError = ''
      if (receiptFile) {
        try {
          finalExpense = await uploadReceipt(finalExpense._id, receiptFile)
        } catch (err) {
          receiptError = err.response?.data?.error ?? 'Expense added, but the receipt failed to upload'
        }
      }
      onAdded(finalExpense)
      resetForm()
      if (receiptError) {
        setError(receiptError)
      } else {
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.error ?? 'Could not add expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Add transaction">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <Segmented options={TYPE_OPTIONS} value={type} onChange={setType} name="txkind" />

        <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr] gap-3.5">
          <Field label="Amount" error={fieldErrors.amount}>
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value)
                clearFieldError('amount')
              }}
            />
          </Field>
          <Field label="Currency">
            <Select value={currency} onChange={(event) => setCurrency(event.target.value)}>
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" error={fieldErrors.category}>
            <Select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                clearFieldError('category')
              }}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            {suggestion && !category && (
              <button
                type="button"
                onClick={() => {
                  setCategory(suggestion.category)
                  setSuggestion(null)
                }}
                className="mt-1.5 inline-flex w-fit items-center rounded-full bg-accent-200 text-accent-deep px-2.5 py-[3px] text-[11px] hover:bg-accent-300 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                Suggested: {suggestion.category}
              </button>
            )}
          </Field>
          <Field label="Date" error={fieldErrors.date}>
            <Input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                clearFieldError('date')
              }}
            />
          </Field>
        </div>

        <Field label="Note">
          <Input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>

        <label className="flex items-center gap-3 border border-dashed border-ink/25 rounded-3xl px-[18px] py-3.5 cursor-pointer bg-sand-deep">
          <span className="w-[34px] h-[34px] rounded-full bg-accent-200 grid place-items-center text-accent-deep text-[17px]">
            ↑
          </span>
          <span className="text-[13px] text-ink-secondary">
            {receiptFile ? receiptFile.name : 'Drop an image here, or choose a file'}
          </span>
          <input
            type="file"
            ref={receiptInputRef}
            accept={ACCEPTED_RECEIPT_TYPES.join(',')}
            className="hidden"
            onChange={handleFile}
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Adding…' : type === 'income' ? 'Add income' : 'Add expense'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default AddTransactionDialog

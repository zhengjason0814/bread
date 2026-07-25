import { useRef, useState } from 'react'
import {
  ACCEPTED_RECEIPT_TYPES,
  receiptTypeError,
  uploadReceipt,
  fetchReceiptUrl,
  deleteReceipt,
} from '../receipts'

function ReceiptCell({ expense, onReceiptChange, isDemo }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const message = receiptTypeError(file)
    if (message) {
      window.alert(message)
      return
    }
    setBusy(true)
    try {
      const updated = await uploadReceipt(expense._id, file)
      onReceiptChange(updated)
    } catch {
      window.alert('Could not upload the receipt')
    } finally {
      setBusy(false)
    }
  }

  async function handleView() {
    const tab = window.open('', '_blank')
    if (tab) tab.opener = null
    try {
      const url = await fetchReceiptUrl(expense._id)
      if (!tab) {
        window.alert('Allow pop-ups to view the receipt')
        return
      }
      tab.location = url
    } catch {
      if (tab) tab.close()
      window.alert('Could not open the receipt')
    }
  }

  async function handleRemove() {
    if (!window.confirm('Remove this receipt?')) return
    setBusy(true)
    try {
      const updated = await deleteReceipt(expense._id)
      onReceiptChange(updated)
    } catch {
      window.alert('Could not remove the receipt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_RECEIPT_TYPES.join(',')}
        onChange={handleFile}
        className="hidden"
      />
      {expense.receipt ? (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={handleView}
            title={expense.receipt.filename}
            aria-label="View receipt"
            className="text-slate-500 hover:text-brand-700 disabled:opacity-50"
          >
            📄
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="text-xs text-slate-400 hover:text-brand-700 disabled:opacity-50"
          >
            Replace
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            aria-label="Remove receipt"
            className="text-slate-400 hover:text-red-600 disabled:opacity-50"
          >
            ✕
          </button>
        </>
      ) : isDemo ? (
        <span className="text-slate-300" title="Sign up to upload receipts">
          📎
        </span>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="text-slate-400 hover:text-brand-700 disabled:opacity-50"
          title="Attach a receipt"
          aria-label="Attach a receipt"
        >
          📎
        </button>
      )}
    </div>
  )
}

export default ReceiptCell

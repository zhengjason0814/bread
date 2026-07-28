import { useRef, useState } from 'react'
import Button from '../ui/Button'
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
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_RECEIPT_TYPES.join(',')}
        onChange={handleFile}
        className="hidden"
      />
      {expense.receipt ? (
        <>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={handleView}
            title={expense.receipt.filename}
            aria-label="View receipt"
          >
            📄
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => inputRef.current?.click()}>
            Replace
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={handleRemove}
            aria-label="Remove receipt"
          >
            ✕
          </Button>
        </>
      ) : isDemo ? (
        <span className="text-ink-faint" title="Sign up to upload receipts">
          📎
        </span>
      ) : (
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          title="Attach a receipt"
          aria-label="Attach a receipt"
        >
          📎
        </Button>
      )}
    </div>
  )
}

export default ReceiptCell

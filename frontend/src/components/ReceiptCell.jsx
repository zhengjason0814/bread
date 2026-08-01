import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import {
  ACCEPTED_RECEIPT_TYPES,
  receiptTypeError,
  uploadReceipt,
  fetchReceiptUrl,
  deleteReceipt,
} from '../receipts'

const NOTICE_MS = 5000

const NOTICE_TONE = {
  error: 'bg-danger-soft text-danger border-danger/25',
  notice: 'bg-notice-soft text-notice-ink border-notice/40',
}

function ReceiptCell({ expense, onReceiptChange, isDemo }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const noticeTimer = useRef(null)

  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  function showNotice(message, tone = 'error') {
    clearTimeout(noticeTimer.current)
    setNotice({ message, tone })
    noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS)
  }

  function dismissNotice() {
    clearTimeout(noticeTimer.current)
    setNotice(null)
  }

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const message = receiptTypeError(file)
    if (message) {
      showNotice(message)
      return
    }
    setBusy(true)
    try {
      const updated = await uploadReceipt(expense._id, file)
      onReceiptChange(updated)
    } catch {
      showNotice('Could not upload the receipt — try again')
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
        showNotice('Your browser blocked the pop-up — allow pop-ups for this site, then try again', 'notice')
        return
      }
      tab.location = url
    } catch {
      if (tab) tab.close()
      showNotice('Could not open the receipt — try again')
    }
  }

  async function confirmRemove() {
    setConfirmingRemove(false)
    setBusy(true)
    try {
      const updated = await deleteReceipt(expense._id)
      onReceiptChange(updated)
    } catch {
      showNotice('Could not remove the receipt — try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex items-center gap-1">
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
            onClick={() => setConfirmingRemove(true)}
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

      {notice && (
        <button
          type="button"
          role="status"
          aria-live="polite"
          onClick={dismissNotice}
          className={`absolute right-0 top-full mt-1.5 z-10 w-max max-w-[220px] text-left rounded-tile border px-3 py-2 text-[12px] leading-snug shadow-lift cursor-pointer ${NOTICE_TONE[notice.tone]}`}
        >
          {notice.message}
        </button>
      )}

      <ConfirmDialog
        open={confirmingRemove}
        title="Remove receipt?"
        message={expense.receipt?.filename}
        confirmLabel="Remove"
        danger
        onConfirm={confirmRemove}
        onCancel={() => setConfirmingRemove(false)}
      />
    </div>
  )
}

export default ReceiptCell

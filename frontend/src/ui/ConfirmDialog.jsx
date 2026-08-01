import Dialog from './Dialog'
import Button from './Button'

function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <div className="flex flex-col gap-[18px]">
        <p className="text-sm text-ink-secondary whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            className={danger ? '!bg-danger hover:!bg-danger/85 active:!bg-danger/75' : ''}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default ConfirmDialog

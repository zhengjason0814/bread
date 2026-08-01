import { useMemo, useState } from 'react'
import { formatMoney, formatSignedMoney } from '../currencies'
import { filterByType } from '../breakdown'
import { isFutureDate } from '../dates'
import { Table, Th, Td } from '../ui/Table'
import Tag from '../ui/Tag'
import Button from '../ui/Button'
import ReceiptCell from './ReceiptCell'
import SplitExpenseDialog from './SplitExpenseDialog'
import ConfirmDialog from '../ui/ConfirmDialog'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function ExpenseList({
  expenses,
  baseCurrency,
  onDelete,
  onReceiptChange,
  onSplitChange,
  anomalyIds,
  recurringIds,
  isDemo,
  filter = 'all',
  accounts = [],
}) {
  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account._id, account])),
    [accounts]
  )
  const [splittingExpense, setSplittingExpense] = useState(null)
  const [deletingExpense, setDeletingExpense] = useState(null)

  const filtered = filterByType(expenses, filter)

  function confirmDelete() {
    onDelete(deletingExpense._id)
    setDeletingExpense(null)
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-ink-muted text-center py-8">
        {expenses.length === 0 ? 'No transactions yet.' : 'No transactions match this filter.'}
      </p>
    )
  }

  return (
    <>
      <Table className="min-w-[820px]">
      <thead>
        <tr>
          <Th>Date</Th>
          <Th>Category</Th>
          <Th>Note</Th>
          <Th>Account</Th>
          <Th align="right">Amount</Th>
          <Th align="right"></Th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((expense) => {
          const account = expense.account ? accountsById.get(expense.account) : null
          return (
            <tr key={expense._id}>
              <Td className="whitespace-nowrap text-ink-secondary">
                {formatDate(expense.date)}
                {isFutureDate(expense.date) && (
                  <Tag variant="outline" className="ml-1.5">
                    Future
                  </Tag>
                )}
              </Td>
              <Td>
                <Tag variant="category" category={expense.category}>
                  {expense.category}
                </Tag>
                {recurringIds?.has(expense._id) && (
                  <Tag variant="outline" className="ml-1.5">
                    Recurring
                  </Tag>
                )}
                {anomalyIds?.has(expense._id) && (
                  <Tag variant="outline" className="ml-1.5">
                    Unusual
                  </Tag>
                )}
                {expense.isShared && (
                  <Tag variant="outline" className="ml-1.5">
                    Split
                  </Tag>
                )}
              </Td>
              <Td className="text-ink-secondary truncate max-w-[220px]">
                {expense.merchant ?? expense.note ?? ''}
              </Td>
              <Td className="text-ink-faint whitespace-nowrap">
                {account ? account.name : 'Manual'}
              </Td>
              <Td
                align="right"
                className={`whitespace-nowrap font-semibold ${
                  expense.type === 'income' ? 'text-sage-deep' : ''
                }`}
              >
                {formatSignedMoney(expense.amount, expense.currency, expense.type)}
                {expense.currency !== baseCurrency && (
                  <div className="text-[11px] text-ink-faint font-normal">
                    {typeof expense.convertedAmount === 'number'
                      ? `≈ ${formatSignedMoney(expense.convertedAmount, baseCurrency, expense.type)}`
                      : 'no rate'}
                  </div>
                )}
                {expense.isShared && (
                  <div className="text-[11px] text-ink-faint font-normal">
                    of {formatMoney(expense.sharedTotal, expense.currency)} total
                  </div>
                )}
              </Td>
              <Td align="right" className="whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <ReceiptCell expense={expense} onReceiptChange={onReceiptChange} isDemo={isDemo} />
                  {expense.type === 'expense' && (
                    <Button variant="ghost" onClick={() => setSplittingExpense(expense)}>
                      Split
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setDeletingExpense(expense)}>
                    Delete
                  </Button>
                </div>
              </Td>
            </tr>
          )
        })}
      </tbody>
      </Table>
      {splittingExpense && (
        <SplitExpenseDialog
          expense={splittingExpense}
          onClose={() => setSplittingExpense(null)}
          onChange={onSplitChange}
        />
      )}
      <ConfirmDialog
        open={!!deletingExpense}
        title="Delete expense?"
        message={
          deletingExpense &&
          `${deletingExpense.category} — ${formatMoney(deletingExpense.amount, deletingExpense.currency)}`
        }
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeletingExpense(null)}
      />
    </>
  )
}

export default ExpenseList

import { useMemo } from 'react'
import { formatMoney, formatSignedMoney } from '../currencies'
import { filterByType } from '../breakdown'
import { isFutureDate } from '../dates'
import { Table, Th, Td } from '../ui/Table'
import Tag from '../ui/Tag'
import Button from '../ui/Button'
import ReceiptCell from './ReceiptCell'

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

  const filtered = filterByType(expenses, filter)

  function handleDeleteClick(expense) {
    const label = `${expense.category} — ${formatMoney(expense.amount, expense.currency)}`
    if (window.confirm(`Delete this expense?\n\n${label}`)) {
      onDelete(expense._id)
    }
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-ink-muted text-center py-8">
        {expenses.length === 0 ? 'No transactions yet.' : 'No transactions match this filter.'}
      </p>
    )
  }

  return (
    <Table>
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
              </Td>
              <Td align="right" className="whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <ReceiptCell expense={expense} onReceiptChange={onReceiptChange} isDemo={isDemo} />
                  <Button variant="ghost" onClick={() => handleDeleteClick(expense)}>
                    Delete
                  </Button>
                </div>
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export default ExpenseList

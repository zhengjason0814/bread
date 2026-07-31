import client from './api/client'

export async function splitExpense(expenseId, share) {
  const response = await client.post(`/expenses/${expenseId}/split`, { share })
  return response.data.expense
}

export async function unsplitExpense(expenseId) {
  const response = await client.delete(`/expenses/${expenseId}/split`)
  return response.data.expense
}

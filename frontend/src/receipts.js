import client from './api/client'

export const ACCEPTED_RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024

export function receiptTypeError(file) {
  if (!ACCEPTED_RECEIPT_TYPES.includes(file.type)) {
    return 'Receipt must be a JPEG, PNG, WebP, or PDF'
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return 'Receipt must be 5 MB or smaller'
  }
  return null
}

export async function uploadReceipt(expenseId, file) {
  const form = new FormData()
  form.append('receipt', file)
  const response = await client.post(`/expenses/${expenseId}/receipt`, form)
  return response.data.expense
}

export async function fetchReceiptUrl(expenseId) {
  const response = await client.get(`/expenses/${expenseId}/receipt`)
  return response.data.url
}

export async function deleteReceipt(expenseId) {
  const response = await client.delete(`/expenses/${expenseId}/receipt`)
  return response.data.expense
}

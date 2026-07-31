import { MERGED_SLICE_NAME } from './breakdown.js'

const COLORS = {
  Dining: { solid: '#cd8a36', ink: '#6b4410' },
  Groceries: { solid: '#4d7c0f', ink: '#365314' },
  'Shopping/Retail': { solid: '#a52a2a', ink: '#6d1c1c' },
  Transportation: { solid: '#6a4c93', ink: '#45305e' },
  Entertainment: { solid: '#ffd700', ink: '#6b5900' },
  'Housing/Utilities': { solid: '#8f5c1c', ink: '#4a2f0d' },
  'Health/Personal Care': { solid: '#c2185b', ink: '#7d1039' },
  Travel: { solid: '#e8a33d', ink: '#7a5214' },
  'General Services': { solid: '#78716c', ink: '#44403c' },
  'Financial/Legal': { solid: '#44403c', ink: '#292524' },
  Withdrawal: { solid: '#8d6e63', ink: '#4e342e' },
  Deposit: { solid: '#7d9d68', ink: '#40532f' },
  Income: { solid: '#2e7d32', ink: '#1c4e1f' },
  Transfer: { solid: '#9c8f8a', ink: '#4d4441' },
  'Credit Card Payment': { solid: '#b0a5a0', ink: '#4f4744' },
  Other: { solid: '#a8a29e', ink: '#4a4542' },
  [MERGED_SLICE_NAME]: { solid: '#c4bdb8', ink: '#4a4542' },
}

export function categoryColor(category) {
  return COLORS[category] ?? COLORS.Other
}

export function categoryTagStyle(category) {
  const { solid, ink } = categoryColor(category)
  return { backgroundColor: `${solid}2e`, color: ink }
}

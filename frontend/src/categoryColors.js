import { MERGED_SLICE_NAME } from './breakdown.js'

const COLORS = {
  Dining: { solid: '#cd8a36', ink: '#6b4410' },
  Groceries: { solid: '#e6b355', ink: '#75540f' },
  'Shopping/Retail': { solid: '#8fa073', ink: '#3d472b' },
  Transportation: { solid: '#ccdbb2', ink: '#465232' },
  Entertainment: { solid: '#ffd9ac', ink: '#7a4d14' },
  'Health/Personal Care': { solid: '#c0b6a5', ink: '#474238' },
  'Housing/Utilities': { solid: '#b17426', ink: '#4a2f0d' },
  Travel: { solid: '#aebf92', ink: '#3d472b' },
  'General Services': { solid: '#dcd3c4', ink: '#474238' },
  'Financial/Legal': { solid: '#82796a', ink: '#2e2b25' },
  Withdrawal: { solid: '#a19786', ink: '#2e2b25' },
  Deposit: { solid: '#728157', ink: '#272e1b' },
  Income: { solid: '#56633f', ink: '#2b3320' },
  Transfer: { solid: '#f2c67e', ink: '#6b4410' },
  'Credit Card Payment': { solid: '#f9e2b4', ink: '#75540f' },
  Other: { solid: '#95591a', ink: '#5c3610' },
  [MERGED_SLICE_NAME]: { solid: '#a19786', ink: '#2e2b25' },
}

export function categoryColor(category) {
  return COLORS[category] ?? COLORS.Other
}

export function categoryTagStyle(category) {
  const { solid, ink } = categoryColor(category)
  return { backgroundColor: `${solid}2e`, color: ink }
}

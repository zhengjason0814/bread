const { randomUUID } = require('crypto')
const Expense = require('../models/Expense')
const Account = require('../models/Account')
const PlaidItem = require('../models/PlaidItem')
const User = require('../models/User')

const MONTH_ANCHORS = [1, 31, 61, 91, 121]

const RECURRING = [
  { note: 'Netflix', amount: 15.99, category: 'Entertainment' },
  { note: 'Spotify', amount: 11.99, category: 'Entertainment' },
  { note: 'Planet Fitness', amount: 39.99, category: 'Health/Personal Care' },
]

const SALARY = { note: 'Acme Payroll', amount: 3200, category: 'Income', type: 'income' }

const ONE_OFFS = [
  { daysAgo: 0, amount: 58.42, category: 'Groceries', note: 'Trader Joe\'s' },
  { daysAgo: 4, amount: 12.75, category: 'Dining', note: 'Chipotle' },
  { daysAgo: 7, amount: 4.85, category: 'Dining', note: 'Blue Bottle Coffee' },
  { daysAgo: 9, amount: 89.3, category: 'Shopping/Retail', note: 'Uniqlo' },
  { daysAgo: 12, amount: 34.6, category: 'Transportation', note: 'Shell Gas' },
  { daysAgo: 15, amount: 21.4, category: 'Dining', note: 'Sweetgreen' },
  { daysAgo: 17, amount: 76.18, category: 'Groceries', note: 'Safeway' },
  { daysAgo: 21, amount: 15.5, category: 'Entertainment', note: 'AMC Theatres' },
  { daysAgo: 25, amount: 42.99, category: 'Shopping/Retail', note: 'Target' },
  { daysAgo: 29, amount: 9.25, category: 'Dining', note: 'Philz Coffee' },
  { daysAgo: 36, amount: 63.18, category: 'Groceries', note: 'Whole Foods' },
  { daysAgo: 39, amount: 27.8, category: 'Transportation', note: 'Uber' },
  { daysAgo: 44, amount: 18.9, category: 'Dining', note: 'Shake Shack' },
  { daysAgo: 50, amount: 120.0, category: 'Housing/Utilities', note: 'PG&E' },
  { daysAgo: 56, amount: 54.32, category: 'Groceries', note: 'Trader Joe\'s' },
  { daysAgo: 62, amount: 31.25, category: 'Shopping/Retail', note: 'Amazon' },
  { daysAgo: 69, amount: 14.2, category: 'Dining', note: 'Chipotle' },
  { daysAgo: 76, amount: 45.6, category: 'Transportation', note: 'Shell Gas' },
  { daysAgo: 82, amount: 68.4, category: 'Groceries', note: 'Safeway' },
  { daysAgo: 89, amount: 22.5, category: 'Entertainment', note: 'Steam' },
  { daysAgo: 96, amount: 120.0, category: 'Housing/Utilities', note: 'PG&E' },
  { daysAgo: 102, amount: 17.75, category: 'Dining', note: 'Sweetgreen' },
  { daysAgo: 110, amount: 59.99, category: 'Shopping/Retail', note: 'Nike' },
  { daysAgo: 117, amount: 48.2, category: 'Groceries', note: 'Whole Foods' },
  { daysAgo: 19, amount: 37.5, category: 'Shopping/Retail', note: 'Etsy' },
  { daysAgo: 86, amount: 52.99, category: 'Shopping/Retail', note: 'Best Buy' },
]

const ANOMALIES = [
  { daysAgo: 6, amount: 214.75, category: 'Dining', note: 'Anniversary Dinner' },
  { daysAgo: 42, amount: 899.0, category: 'Shopping/Retail', note: 'Apple Store' },
]

const BUDGETS = { Dining: 250, Groceries: 600 }

function dateDaysAgo(days) {
  const now = Date.now()
  return new Date(now - days * 24 * 60 * 60 * 1000)
}

function buildTemplate() {
  const rows = []
  for (const anchor of MONTH_ANCHORS) {
    rows.push({ daysAgo: anchor, amount: SALARY.amount, category: SALARY.category, note: SALARY.note, type: 'income' })
    RECURRING.forEach((sub, index) => {
      rows.push({ daysAgo: anchor + index + 1, amount: sub.amount, category: sub.category, note: sub.note, type: 'expense' })
    })
  }
  for (const row of ONE_OFFS) rows.push({ ...row, type: 'expense' })
  for (const row of ANOMALIES) rows.push({ ...row, type: 'expense' })

  if (Math.min(...rows.map((row) => row.daysAgo)) > 0) {
    throw new Error(
      'Demo TEMPLATE has no row at daysAgo: 0 — "this month" would render empty for the first days of every calendar month'
    )
  }

  return rows
}

const TEMPLATE = buildTemplate()
const DEMO_EXPENSE_COUNT = TEMPLATE.length

async function seedDemoUser(userId) {
  const item = await PlaidItem.create({
    user: userId,
    itemId: `demo-item-${randomUUID()}`,
    accessToken: 'demo-no-access',
    institutionName: 'Demo Bank',
  })

  await Account.create([
    {
      user: userId,
      item: item._id,
      plaidAccountId: `demo-acct-${randomUUID()}`,
      name: 'Demo Checking',
      mask: '4821',
      type: 'depository',
      subtype: 'checking',
      currency: 'USD',
      balance: 4213.57,
    },
    {
      user: userId,
      item: item._id,
      plaidAccountId: `demo-acct-${randomUUID()}`,
      name: 'Demo Credit Card',
      mask: '9033',
      type: 'credit',
      subtype: 'credit card',
      currency: 'USD',
      balance: 612.4,
    },
  ])

  await Expense.insertMany(
    TEMPLATE.map((row) => ({
      user: userId,
      amount: row.amount,
      currency: 'USD',
      category: row.category,
      date: dateDaysAgo(row.daysAgo),
      note: row.note,
      type: row.type,
      source: 'manual',
    }))
  )

  await User.findByIdAndUpdate(userId, { budgets: BUDGETS })
}

async function clearDemoUserData(userId) {
  await Expense.deleteMany({ user: userId })
  await Account.deleteMany({ user: userId })
  await PlaidItem.deleteMany({ user: userId })
  await User.findByIdAndUpdate(userId, { budgets: {} })
}

module.exports = { seedDemoUser, clearDemoUserData, DEMO_EXPENSE_COUNT, TEMPLATE }

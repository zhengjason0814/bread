const express = require('express')
const requireAuth = require('../middleware/auth')
const requireAdmin = require('../middleware/requireAdmin')
const User = require('../models/User')
const Expense = require('../models/Expense')
const PlaidItem = require('../models/PlaidItem')
const { convertExpenses } = require('../services/exchangeRates')
const { isSpend } = require('../services/spendFilter')

const router = express.Router()
router.use(requireAuth)
router.use(requireAdmin)

const ADMIN_BASE_CURRENCY = 'USD'

function countByUser(rows) {
  return new Map(rows.map((row) => [String(row._id), row.count]))
}

router.get('/stats', async (req, res) => {
  const users = await User.find().select('email createdAt').lean()

  const bankCounts = countByUser(
    await PlaidItem.aggregate([{ $group: { _id: '$user', count: { $sum: 1 } } }])
  )
  const expenseCounts = countByUser(
    await Expense.aggregate([{ $group: { _id: '$user', count: { $sum: 1 } } }])
  )

  const spendRows = await Expense.find()
    .select('user amount currency date type category')
    .lean()
  const converted = await convertExpenses(spendRows.filter(isSpend), ADMIN_BASE_CURRENCY)

  const spendByUser = new Map()
  let totalSpend = 0
  for (const expense of converted) {
    if (expense.convertedAmount === null) continue
    totalSpend += expense.convertedAmount
    const key = String(expense.user)
    spendByUser.set(key, (spendByUser.get(key) ?? 0) + expense.convertedAmount)
  }

  const userRows = users
    .map((user) => {
      const key = String(user._id)
      return {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        expenseCount: expenseCounts.get(key) ?? 0,
        bankCount: bankCounts.get(key) ?? 0,
        totalSpend: Math.round((spendByUser.get(key) ?? 0) * 100) / 100,
      }
    })
    .sort((a, b) => b.totalSpend - a.totalSpend)

  const sum = (map) => [...map.values()].reduce((a, b) => a + b, 0)

  res.json({
    baseCurrency: ADMIN_BASE_CURRENCY,
    totals: {
      userCount: users.length,
      expenseCount: sum(expenseCounts),
      bankCount: sum(bankCounts),
      totalSpend: Math.round(totalSpend * 100) / 100,
    },
    users: userRows,
  })
})

module.exports = router

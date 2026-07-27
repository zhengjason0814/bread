const os = require('os')
const express = require('express')
const { apiLimiter } = require('./middleware/rateLimit')
const authRoutes = require('./routes/auth')
const expenseRoutes = require('./routes/expenses')
const plaidRoutes = require('./routes/plaid')
const accountRoutes = require('./routes/accounts')
const insightRoutes = require('./routes/insights')
const budgetRoutes = require('./routes/budgets')
const adminRoutes = require('./routes/admin')
const demoRoutes = require('./routes/demo')

const app = express()
app.set('trust proxy', 1)
app.use(express.json())
app.use('/api', apiLimiter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', instance: os.hostname() })
})

app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/plaid', plaidRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/insights', insightRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/demo', demoRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app

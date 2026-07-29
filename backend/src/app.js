const os = require('os')
const express = require('express')
const cors = require('cors')
const { apiLimiter } = require('./middleware/rateLimit')
const authRoutes = require('./routes/auth')
const expenseRoutes = require('./routes/expenses')
const plaidRoutes = require('./routes/plaid')
const accountRoutes = require('./routes/accounts')
const insightRoutes = require('./routes/insights')
const budgetRoutes = require('./routes/budgets')
const adminRoutes = require('./routes/admin')
const demoRoutes = require('./routes/demo')

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const app = express()
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 1)
if (allowedOrigins.length > 0) {
  app.use(cors({ origin: allowedOrigins }))
}
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

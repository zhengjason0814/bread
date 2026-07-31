const express = require('express')
const multer = require('multer')
const Expense = require('../models/Expense')
const User = require('../models/User')
const requireAuth = require('../middleware/auth')
const { blockDemo } = require('../middleware/demoGuards')
const { convertExpenses } = require('../services/exchangeRates')
const { CATEGORIES } = require('../constants/categories')
const { TRANSACTION_TYPES } = require('../constants/transactionTypes')
const receiptStorage = require('../services/receiptStorage')
const { clearInsightsCache } = require('../services/insightsCache')

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RECEIPT_BYTES },
  fileFilter: (req, file, cb) => {
    if (receiptStorage.ACCEPTED_TYPES.includes(file.mimetype)) return cb(null, true)
    const error = new Error('Unsupported receipt type')
    error.code = 'UNSUPPORTED_TYPE'
    cb(error)
  },
})

function receiptUpload(req, res, next) {
  upload.single('receipt')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Receipt must be 5 MB or smaller' })
    }
    if (err && err.code === 'UNSUPPORTED_TYPE') {
      return res.status(400).json({ error: 'Receipt must be a JPEG, PNG, WebP, or PDF' })
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Invalid receipt upload' })
    }
    if (err) return next(err)
    next()
  })
}

const router = express.Router()
router.use(requireAuth)

router.post('/', async (req, res) => {
  const { amount, currency, category, date, note, type } = req.body
  const trimmedNote = (note || '').trim()
  if (amount === undefined || !category || !date || !trimmedNote || !type) {
    return res.status(400).json({ error: 'amount, category, date, note, and type are required' })
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(', ')}` })
  }
  if (!TRANSACTION_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${TRANSACTION_TYPES.join(', ')}` })
  }

  const created = await Expense.create({
    user: req.userId,
    amount,
    currency,
    category,
    date,
    note: trimmedNote,
    type,
  })

  await clearInsightsCache(req.userId)

  const user = await User.findById(req.userId).select('baseCurrency')
  const [expense] = await convertExpenses([created], user.baseCurrency)

  res.status(201).json({ expense })
})

router.get('/', async (req, res) => {
  const user = await User.findById(req.userId).select('baseCurrency')
  const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 }).lean()
  const converted = await convertExpenses(expenses, user.baseCurrency)
  res.json({ expenses: converted, baseCurrency: user.baseCurrency })
})

router.delete('/:id', async (req, res) => {
  const deleted = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.userId,
  })

  if (!deleted) {
    return res.status(404).json({ error: 'Expense not found' })
  }

  await clearInsightsCache(req.userId)

  if (deleted.receipt) {
    try {
      await receiptStorage.deleteReceipt(deleted.receipt.key)
    } catch {
    }
  }

  res.json({ deleted: deleted._id })
})

router.post('/dismiss-anomalies', async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' })
  }

  const result = await Expense.updateMany(
    { _id: { $in: ids }, user: req.userId },
    { anomalyDismissed: true }
  )

  await clearInsightsCache(req.userId)

  res.json({ dismissed: result.modifiedCount })
})

router.post('/:id/dismiss-anomaly', async (req, res) => {
  const updated = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { anomalyDismissed: true },
    { returnDocument: 'after' }
  )

  if (!updated) {
    return res.status(404).json({ error: 'Expense not found' })
  }

  await clearInsightsCache(req.userId)

  res.json({ expense: updated })
})

router.post('/:id/split', async (req, res) => {
  const { share } = req.body

  const expense = await Expense.findOne({ _id: req.params.id, user: req.userId })
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' })
  }
  if (expense.type !== 'expense') {
    return res.status(400).json({ error: 'Only expenses can be split' })
  }

  const total = expense.isShared ? expense.sharedTotal : expense.amount
  if (typeof share !== 'number' || !(share > 0) || share > total) {
    return res.status(400).json({ error: `share must be greater than 0 and at most ${total}` })
  }

  expense.sharedTotal = total
  expense.amount = share
  expense.isShared = true
  await expense.save()

  await clearInsightsCache(req.userId)

  const user = await User.findById(req.userId).select('baseCurrency')
  const [converted] = await convertExpenses([expense.toObject()], user.baseCurrency)
  res.json({ expense: converted })
})

router.delete('/:id/split', async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.userId })
  if (!expense || !expense.isShared) {
    return res.status(404).json({ error: 'Expense is not split' })
  }

  expense.amount = expense.sharedTotal
  expense.isShared = false
  expense.sharedTotal = undefined
  await expense.save()

  await clearInsightsCache(req.userId)

  const user = await User.findById(req.userId).select('baseCurrency')
  const [converted] = await convertExpenses([expense.toObject()], user.baseCurrency)
  res.json({ expense: converted })
})

router.post('/:id/receipt', blockDemo, receiptUpload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'A receipt file (JPEG, PNG, WebP, or PDF) is required' })
  }

  const expense = await Expense.findOne({ _id: req.params.id, user: req.userId })
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' })
  }

  const previousKey = expense.receipt?.key
  const key = receiptStorage.buildKey(req.userId, expense._id, req.file.mimetype)
  await receiptStorage.putReceipt(req.file.buffer, key, req.file.mimetype)

  expense.receipt = {
    key,
    filename: req.file.originalname,
    contentType: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date(),
  }
  await expense.save()

  if (previousKey) {
    try {
      await receiptStorage.deleteReceipt(previousKey)
    } catch {
    }
  }

  const user = await User.findById(req.userId).select('baseCurrency')
  const [converted] = await convertExpenses([expense.toObject()], user.baseCurrency)
  res.status(200).json({ expense: converted })
})

router.get('/:id/receipt', async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.userId })
  if (!expense || !expense.receipt) {
    return res.status(404).json({ error: 'Receipt not found' })
  }
  const url = await receiptStorage.getPresignedViewUrl(expense.receipt.key)
  res.json({ url })
})

router.delete('/:id/receipt', async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.userId })
  if (!expense || !expense.receipt) {
    return res.status(404).json({ error: 'Receipt not found' })
  }

  await receiptStorage.deleteReceipt(expense.receipt.key)

  const updated = await Expense.findByIdAndUpdate(
    expense._id,
    { $unset: { receipt: '' } },
    { returnDocument: 'after' }
  ).lean()

  const user = await User.findById(req.userId).select('baseCurrency')
  const [converted] = await convertExpenses([updated], user.baseCurrency)
  res.json({ expense: converted })
})

module.exports = router

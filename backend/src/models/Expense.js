const mongoose = require('mongoose')
const { CATEGORIES } = require('../constants/categories')

const receiptSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    type: { type: String, required: true, enum: ['expense', 'income'] },
    category: { type: String, required: true, trim: true, enum: CATEGORIES },
    date: { type: Date, required: true },
    note: { type: String, required: true, trim: true },
    source: { type: String, enum: ['manual', 'plaid'], default: 'manual' },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
    plaidTransactionId: { type: String, unique: true, sparse: true, default: undefined },
    merchant: { type: String, trim: true },
    pending: { type: Boolean, default: false },
    anomalyDismissed: { type: Boolean, default: false },
    receipt: { type: receiptSchema, default: undefined },
    isShared: { type: Boolean, default: false },
    sharedTotal: { type: Number, default: undefined },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Expense', expenseSchema)

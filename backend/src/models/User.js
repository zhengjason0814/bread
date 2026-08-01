const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, unique: true, sparse: true, default: undefined },
    name: { type: String, default: '', trim: true, maxlength: 40 },
    baseCurrency: { type: String, default: 'USD', uppercase: true, trim: true },
    budgets: { type: Map, of: Number, default: {} },
    isDemo: { type: Boolean, default: false },
    demoCreatedAt: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)

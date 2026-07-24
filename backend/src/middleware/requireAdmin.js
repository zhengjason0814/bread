const User = require('../models/User')
const { isAdminEmail } = require('../services/adminAccess')

async function requireAdmin(req, res, next) {
  const user = await User.findById(req.userId).select('email')
  if (!user || !isAdminEmail(user.email)) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = requireAdmin

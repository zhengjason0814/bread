function blockDemo(req, res, next) {
  if (req.isDemo) {
    return res.status(403).json({ error: 'This feature is disabled in demo mode. Sign up to use it.' })
  }
  next()
}

function requireDemo(req, res, next) {
  if (!req.isDemo) {
    return res.status(403).json({ error: 'Demo-only action' })
  }
  next()
}

module.exports = { blockDemo, requireDemo }

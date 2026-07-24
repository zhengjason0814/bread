function adminEmailSet() {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

function isAdminEmail(email) {
  if (!email) return false
  return adminEmailSet().has(email.trim().toLowerCase())
}

module.exports = { isAdminEmail }

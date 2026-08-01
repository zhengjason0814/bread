let client = null

function getClient() {
  if (!client) {
    const { OAuth2Client } = require('google-auth-library')
    client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  }
  return client
}

module.exports = {
  verifyIdToken: (options) => getClient().verifyIdToken(options),
}

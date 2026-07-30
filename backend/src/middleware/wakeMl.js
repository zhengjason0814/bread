const { wake } = require('../services/mlClient')

function wakeMl(req, res, next) {
  wake()
  next()
}

module.exports = wakeMl

require('dotenv').config({ quiet: true })
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 4000
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET']

const missing = REQUIRED_ENV.filter((name) => !process.env[name])
if (missing.length > 0) {
  console.error(`Cannot start: missing required environment ${missing.join(', ')}`)
  process.exit(1)
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error(`Cannot start: MongoDB connection failed — ${error.message}`)
    process.exit(1)
  })

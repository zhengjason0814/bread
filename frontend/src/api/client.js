import axios from 'axios'
import { baseMessage, rateLimitMessage, reportRateLimit, retryAfterSeconds } from '../rateLimit'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const body =
        typeof error.response.data === 'object' && error.response.data !== null
          ? error.response.data
          : {}
      const seconds = retryAfterSeconds(error.response)
      const message = baseMessage(body.error)
      reportRateLimit({ message, seconds })
      error.response.data = {
        ...body,
        error: rateLimitMessage(message, seconds),
        rateLimit: { message, seconds },
      }
    }
    return Promise.reject(error)
  },
)

export default client

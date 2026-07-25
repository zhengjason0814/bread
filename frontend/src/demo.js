import client from './api/client'

export async function startDemo() {
  const response = await client.post('/demo')
  return response.data.token
}

export async function resetDemo() {
  await client.post('/demo/reset')
}

export async function endDemo() {
  await client.delete('/demo')
}

import { useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import client from '../api/client'
import Button from '../ui/Button'

function ConnectBank({ onConnected }) {
  const [linkToken, setLinkToken] = useState(null)
  const [busy, setBusy] = useState(false)

  async function exchange(publicToken, metadata, confirmDuplicate = false) {
    try {
      await client.post('/plaid/exchange', {
        public_token: publicToken,
        institution_id: metadata.institution?.institution_id,
        institution_name: metadata.institution?.name,
        confirm_duplicate: confirmDuplicate,
      })
      setLinkToken(null)
      onConnected()
    } catch (err) {
      if (err.response?.status === 409) {
        const { institutionName } = err.response.data
        if (
          window.confirm(
            `You already have ${institutionName} connected. Connect another login anyway?`
          )
        ) {
          await exchange(publicToken, metadata, true)
        } else {
          setLinkToken(null)
        }
      } else {
        throw err
      }
    }
  }

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      setBusy(true)
      try {
        await exchange(publicToken, metadata)
      } finally {
        setBusy(false)
      }
    },
  })

  useEffect(() => {
    if (linkToken && ready) {
      open()
    }
  }, [linkToken, ready, open])

  async function handleClick() {
    setBusy(true)
    try {
      const response = await client.post('/plaid/link-token')
      setLinkToken(response.data.link_token)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="primary" stopPropagation onClick={handleClick} disabled={busy}>
      {busy ? 'Connecting…' : '+ Connect a bank'}
    </Button>
  )
}

export default ConnectBank

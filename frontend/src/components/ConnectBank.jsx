import { useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import client from '../api/client'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'

function ConnectBank({ onConnected }) {
  const [linkToken, setLinkToken] = useState(null)
  const [busy, setBusy] = useState(false)
  const [duplicatePrompt, setDuplicatePrompt] = useState(null)

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
        setDuplicatePrompt({ publicToken, metadata, institutionName })
      } else {
        throw err
      }
    }
  }

  async function confirmDuplicateConnection() {
    const { publicToken, metadata } = duplicatePrompt
    setDuplicatePrompt(null)
    setBusy(true)
    try {
      await exchange(publicToken, metadata, true)
    } finally {
      setBusy(false)
    }
  }

  function cancelDuplicateConnection() {
    setDuplicatePrompt(null)
    setLinkToken(null)
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
    <>
      <Button variant="primary" stopPropagation onClick={handleClick} disabled={busy}>
        {busy ? 'Connecting…' : '+ Connect a bank'}
      </Button>
      <ConfirmDialog
        open={!!duplicatePrompt}
        title="Already connected"
        message={`You already have ${duplicatePrompt?.institutionName} connected. Connect another login anyway?`}
        confirmLabel="Connect anyway"
        onConfirm={confirmDuplicateConnection}
        onCancel={cancelDuplicateConnection}
      />
    </>
  )
}

export default ConnectBank

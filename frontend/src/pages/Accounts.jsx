import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ListPage, { ListRow } from '../components/ListPage'
import ConnectBank from '../components/ConnectBank'
import HowToConnectVideo from '../components/HowToConnectVideo'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import { formatMoney } from '../currencies'
import { ListRowsSkeleton } from '../components/Skeletons'

function groupByConnection(accounts) {
  const groups = new Map()
  for (const account of accounts) {
    const itemId = account.item?._id ?? 'unknown'
    if (!groups.has(itemId)) {
      groups.set(itemId, {
        itemId,
        institutionName: account.item?.institutionName || 'Linked bank',
        accounts: [],
      })
    }
    groups.get(itemId).accounts.push(account)
  }
  return Array.from(groups.values())
}

function AccountGroup({ group, isDemo, onDisconnect }) {
  const [confirming, setConfirming] = useState(false)
  const label = group.accounts.length === 1 ? '1 account' : `${group.accounts.length} accounts`

  function confirmDisconnect() {
    setConfirming(false)
    onDisconnect(group.itemId)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3.5 pt-4 pb-1">
        <span className="font-display text-[15px]">{group.institutionName}</span>
        {!isDemo && (
          <Button variant="ghost" className="ml-auto" onClick={() => setConfirming(true)}>
            Disconnect
          </Button>
        )}
      </div>
      {group.accounts.map((account) => (
        <ListRow
          key={account._id}
          primary={`${account.name}${account.mask ? ` ••${account.mask}` : ''}`}
          description={<span className="capitalize">{account.subtype || account.type}</span>}
          amount={
            typeof account.balance === 'number'
              ? formatMoney(account.balance, account.currency)
              : undefined
          }
        />
      ))}
      <ConfirmDialog
        open={confirming}
        title={`Disconnect ${group.institutionName}?`}
        message={`This will remove its ${label} and all imported transactions. This can't be undone.`}
        confirmLabel="Disconnect"
        danger
        onConfirm={confirmDisconnect}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}

function Accounts() {
  const { loading, error, ...data } = useOutletContext()
  const { accounts, syncing, isDemo, onSync, onAccountDisconnected, reload } = data

  const groups = groupByConnection(accounts)

  return (
    <ListPage
      title="Accounts"
      blurb="Banks and cards linked through Plaid."
      actions={
        isDemo ? (
          <span className="text-sm text-ink-muted" title="Sign up to connect a bank">
            Sync &amp; connect disabled in demo
          </span>
        ) : (
          <>
            {accounts.length > 0 && (
              <Button variant="secondary" onClick={onSync} disabled={syncing}>
                {syncing ? 'Syncing…' : 'Sync'}
              </Button>
            )}
            <ConnectBank onConnected={reload} />
          </>
        )
      }
    >
      {!loading && !error && <HowToConnectVideo defaultOpen={groups.length === 0} />}

      {loading ? (
        <ListRowsSkeleton />
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-ink-secondary">
          No linked accounts yet. Connect a bank to import transactions automatically.
        </p>
      ) : (
        groups.map((group) => (
          <AccountGroup
            key={group.itemId}
            group={group}
            isDemo={isDemo}
            onDisconnect={onAccountDisconnected}
          />
        ))
      )}
    </ListPage>
  )
}

export default Accounts

import { useOutletContext } from 'react-router-dom'
import ListPage, { ListRow } from '../components/ListPage'
import ConnectBank from '../components/ConnectBank'
import Button from '../ui/Button'
import { formatMoney } from '../currencies'

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
  function handleDisconnect() {
    const label = group.accounts.length === 1 ? '1 account' : `${group.accounts.length} accounts`
    if (
      window.confirm(
        `Disconnect ${group.institutionName}? This will remove its ${label} and all imported transactions. This can't be undone.`
      )
    ) {
      onDisconnect(group.itemId)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3.5 pt-4 pb-1">
        <span className="font-display text-[15px]">{group.institutionName}</span>
        {!isDemo && (
          <Button variant="ghost" className="ml-auto" onClick={handleDisconnect}>
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
      {loading ? (
        <p className="text-ink-muted text-center">Loading…</p>
      ) : error ? (
        <p className="text-accent-deep text-center">{error}</p>
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

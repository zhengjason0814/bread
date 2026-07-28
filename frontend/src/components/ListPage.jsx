import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import Card from '../ui/Card'

export function ListRow({ primary, description, amount, trailing }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 py-[13px] border-b border-rule-soft text-sm">
      <span className="font-semibold w-full sm:w-auto sm:min-w-[190px]">{primary}</span>
      <span className="text-ink-muted flex-1 min-w-0">{description}</span>
      {amount && <span className="font-semibold whitespace-nowrap">{amount}</span>}
      {trailing}
    </div>
  )
}

function ListPage({ title, blurb, actions, children }) {
  const navigate = useNavigate()

  return (
    <main className="px-4 sm:px-[30px] pt-3.5 pb-[34px] flex flex-col gap-4 flex-1 h-full">
      <Button variant="ghost" className="self-start" onClick={() => navigate('/')}>
        ← Back to dashboard
      </Button>
      <Card className="flex flex-col gap-3.5 flex-1 min-h-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-display text-[19px] sm:text-[22px]">{title}</h2>
          {actions && <div className="ml-auto flex gap-2">{actions}</div>}
        </div>
        <p className="text-sm text-ink-secondary">{blurb}</p>
        <div className="flex flex-col mt-1.5 flex-1 min-h-0 overflow-auto">{children}</div>
      </Card>
    </main>
  )
}

export default ListPage

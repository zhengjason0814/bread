import { useEffect, useRef, useState } from 'react'
import BreadMascot from './BreadMascot'
import Card from '../ui/Card'
import Label from '../ui/Label'
import { budgetHeadline } from '../budgets'
import { formatMoney } from '../currencies'
import { displayName, greetingParts, timeOfDayGreeting } from '../greeting'
import { useTypewriter } from '../typewriter'

const POKE_LINES = ['Hey that tickles!', 'Stop that!', 'Woahhh!']
const POKE_MS = 1500
const MAX_NAME_LENGTH = 40

function nextPokeLine(current) {
  const options = POKE_LINES.filter((line) => line !== current)
  return options[Math.floor(Math.random() * options.length)]
}

function SpokenLine({ text, typed, showCaret }) {
  return (
    <span className="grid" aria-hidden="true">
      <span className="col-start-1 row-start-1 invisible">{text}</span>
      <span className="col-start-1 row-start-1">
        {typed}
        {showCaret && (
          <span className="inline-block w-[2px] h-[0.85em] translate-y-[0.12em] ml-[3px] bg-ink/55 motion-safe:animate-pulse" />
        )}
      </span>
    </span>
  )
}

function NameField({ value, onCommit, onCancel }) {
  const [draft, setDraft] = useState(value)
  const cancelledRef = useRef(false)

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelledRef.current = true
      onCancel()
    }
  }

  function handleBlur() {
    if (cancelledRef.current) {
      cancelledRef.current = false
      return
    }
    onCommit(draft)
  }

  return (
    <input
      autoFocus
      value={draft}
      maxLength={MAX_NAME_LENGTH}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      aria-label="Your display name"
      placeholder="Your name"
      className="font-display text-lg w-full bg-sand-deep rounded-[10px] px-2.5 py-1 outline-2 outline-accent"
    />
  )
}

function GreetingRow({ accounts, expenses, budgets, baseCurrency, email, name, onNameChange }) {
  const deposits = accounts.filter((account) => account.type === 'depository')
  const credits = accounts.filter((account) => account.type === 'credit')
  const bankBalance = deposits.reduce(
    (sum, account) =>
      typeof account.convertedBalance === 'number' ? sum + account.convertedBalance : sum,
    0,
  )
  const creditOwed = credits.reduce(
    (sum, account) =>
      typeof account.convertedBalance === 'number' ? sum + account.convertedBalance : sum,
    0,
  )

  const [pokeLine, setPokeLine] = useState(null)
  const [introDone, setIntroDone] = useState(false)
  const [editingName, setEditingName] = useState(false)

  const shownName = displayName(email, name)
  const greeting = timeOfDayGreeting(shownName)
  const { prefix, suffix } = greetingParts(shownName)

  function handleNameCommit(draft) {
    setEditingName(false)
    const next = draft.trim()
    if (next !== (name ?? '').trim()) onNameChange(next)
  }
  const headline = budgetHeadline(expenses, budgets)
  const spoken = pokeLine ?? greeting

  const { typed: typedGreeting, done: greetingDone } = useTypewriter(spoken, 26)
  const showName = greetingDone && !pokeLine && !editingName
  const { typed: typedHeadline, done: headlineDone } = useTypewriter(introDone ? headline : '', 14)

  useEffect(() => {
    if (greetingDone) setIntroDone(true)
  }, [greetingDone])

  useEffect(() => {
    if (!pokeLine) return undefined
    const timer = setTimeout(() => setPokeLine(null), POKE_MS)
    return () => clearTimeout(timer)
  }, [pokeLine])

  return (
    <div className="flex flex-wrap items-stretch gap-4 pb-5">
      <Card className="flex items-center gap-4 flex-1 basis-[420px] min-w-[300px]">
      <div className="flex-none w-[96px] h-[96px] sm:w-[132px] sm:h-[132px] rounded-full bg-sand-deep grid place-items-center">
        <BreadMascot
          className="w-[88px] h-[88px] sm:w-[120px] sm:h-[120px]"
          onPoke={() => setPokeLine((current) => nextPokeLine(current))}
        />
      </div>
      <div className="relative flex-1 min-w-0 bg-sand rounded-tile px-4 py-3.5">
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 rounded-[3px] bg-sand"
        />
        {showName ? (
          <span className="sr-only">{headline}</span>
        ) : (
          <span className="sr-only">{pokeLine ?? `${greeting} ${headline}`}</span>
        )}
        <p className="font-display text-lg">
          {editingName ? (
            <NameField
              value={name ?? ''}
              onCommit={handleNameCommit}
              onCancel={() => setEditingName(false)}
            />
          ) : showName ? (
            <span>
              {prefix}
              <button
                type="button"
                onClick={() => setEditingName(true)}
                aria-label={`Edit your display name, currently ${shownName}`}
                className="rounded-[4px] underline decoration-dotted decoration-ink-faint underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                {shownName}
                {suffix}
                <span aria-hidden="true" className="ml-1.5 text-[13px] text-ink-faint">
                  ✎
                </span>
              </button>
            </span>
          ) : (
            <SpokenLine text={spoken} typed={typedGreeting} showCaret={!greetingDone} />
          )}
        </p>
        {!pokeLine && (
          <p className="text-[13px] text-ink-secondary mt-1">
            <SpokenLine
              text={headline}
              typed={typedHeadline}
              showCaret={greetingDone && !headlineDone}
            />
          </p>
        )}
      </div>
      </Card>

      <Card className="flex flex-col justify-center flex-1 basis-[200px] min-w-[190px]">
        <Label>Bank balance</Label>
        <p className="font-display text-[30px] sm:text-[36px] leading-[1.1] mt-1.5">
          {formatMoney(bankBalance, baseCurrency)}
        </p>
        <p className="text-[12px] text-ink-muted mt-1">
          across {deposits.length} {deposits.length === 1 ? 'account' : 'accounts'}
        </p>
      </Card>

      {credits.length > 0 && (
        <Card className="flex flex-col justify-center flex-1 basis-[200px] min-w-[190px]">
          <Label>Credit Balance</Label>
          <p className="font-display text-[30px] sm:text-[36px] leading-[1.1] mt-1.5 text-danger">
            {formatMoney(creditOwed, baseCurrency)}
          </p>
          <p className="text-[12px] text-ink-muted mt-1">
            across {credits.length} {credits.length === 1 ? 'card' : 'cards'}
          </p>
        </Card>
      )}
    </div>
  )
}

export default GreetingRow

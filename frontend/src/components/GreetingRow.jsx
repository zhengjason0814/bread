import { useEffect, useState } from 'react'
import BreadMascot from './BreadMascot'
import Label from '../ui/Label'
import { budgetHeadline } from '../budgets'
import { formatMoney } from '../currencies'
import { displayName, timeOfDayGreeting } from '../greeting'
import { useTypewriter } from '../typewriter'

const POKE_LINES = ['Hey that tickles!', 'Stop that!', 'Woahhh!']
const POKE_MS = 1500

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

function GreetingRow({ accounts, expenses, budgets, baseCurrency, email }) {
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

  const greeting = timeOfDayGreeting(displayName(email))
  const headline = budgetHeadline(expenses, budgets)
  const spoken = pokeLine ?? greeting

  const { typed: typedGreeting, done: greetingDone } = useTypewriter(spoken, 26)
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
    <div className="flex items-center gap-x-[26px] gap-y-4 px-2.5 pt-1.5 pb-[22px] flex-wrap">
      <div className="flex-none w-[110px] h-[110px] sm:w-[170px] sm:h-[170px] rounded-full bg-sand-deep grid place-items-center">
        <BreadMascot
          className="w-[100px] h-[100px] sm:w-[156px] sm:h-[156px]"
          onPoke={() => setPokeLine((current) => nextPokeLine(current))}
        />
      </div>
      <div className="relative flex-1 min-w-0 sm:flex-none sm:max-w-[300px] bg-card rounded-tile px-5 py-4 drop-shadow-bubble">
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 rounded-[3px] bg-card"
        />
        <span className="sr-only">{pokeLine ?? `${greeting} ${headline}`}</span>
        <p className="font-display text-lg">
          <SpokenLine text={spoken} typed={typedGreeting} showCaret={!greetingDone} />
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
      <div className="w-full lg:w-auto lg:ml-auto flex flex-wrap gap-x-11 gap-y-4 pr-2.5">
        <div>
          <Label>Bank balance</Label>
          <p className="font-display text-[30px] sm:text-[40px] leading-[1.1] mt-1.5">
            {formatMoney(bankBalance, baseCurrency)}
          </p>
        </div>
        {credits.length > 0 && (
          <div>
            <Label>Credit owed</Label>
            <p className="font-display text-[30px] sm:text-[40px] leading-[1.1] mt-1.5 text-accent-deep">
              {formatMoney(creditOwed, baseCurrency)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GreetingRow

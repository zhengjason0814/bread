import BreadMark from '../ui/BreadMark'
import Label from '../ui/Label'
import { budgetHeadline } from '../budgets'
import { formatMoney } from '../currencies'
import { displayName, timeOfDayGreeting } from '../greeting'

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

  return (
    <div className="flex items-center gap-[26px] px-2.5 pt-1.5 pb-[22px] flex-wrap">
      <div className="flex-none w-[170px] h-[170px] rounded-full bg-sand-deep grid place-items-center">
        <BreadMark className="w-[110px] h-[110px] text-accent" scoreClassName="stroke-accent-100" />
      </div>
      <div className="flex-none max-w-[300px] bg-card rounded-tile px-5 py-4 shadow-card">
        <p className="font-display text-lg">
          {timeOfDayGreeting()}, {displayName(email)}.
        </p>
        <p className="text-[13px] text-ink-secondary mt-1">{budgetHeadline(expenses, budgets)}</p>
      </div>
      <div className="ml-auto flex gap-11 pr-2.5">
        <div>
          <Label>Bank balance</Label>
          <p className="font-display text-[40px] leading-[1.1] mt-1.5">
            {formatMoney(bankBalance, baseCurrency)}
          </p>
        </div>
        {credits.length > 0 && (
          <div>
            <Label>Credit owed</Label>
            <p className="font-display text-[40px] leading-[1.1] mt-1.5 text-accent-deep">
              {formatMoney(creditOwed, baseCurrency)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GreetingRow

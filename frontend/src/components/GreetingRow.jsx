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
    <div className="flex items-center gap-x-[26px] gap-y-4 px-2.5 pt-1.5 pb-[22px] flex-wrap">
      <div className="flex-none w-[110px] h-[110px] sm:w-[170px] sm:h-[170px] rounded-full bg-sand-deep grid place-items-center">
        <BreadMark
          className="w-[72px] h-[72px] sm:w-[110px] sm:h-[110px] text-accent"
          scoreClassName="stroke-accent-100"
        />
      </div>
      <div className="flex-1 min-w-0 sm:flex-none sm:max-w-[300px] bg-card rounded-tile px-5 py-4 shadow-card">
        <p className="font-display text-lg">
          {timeOfDayGreeting()}, {displayName(email)}.
        </p>
        <p className="text-[13px] text-ink-secondary mt-1">{budgetHeadline(expenses, budgets)}</p>
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

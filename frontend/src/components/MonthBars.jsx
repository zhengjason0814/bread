import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from 'recharts'
import { compactMoney } from '../currencies'

const PAST_FILL = '#eddcae'
const CURRENT_FILL = '#cd8a36'
const FORECAST_FILL = '#fcf2d7'
const FORECAST_STROKE = '#cd8a36'
const FORECAST_DASH = '3 2.5'

function monthShortLabel(monthKey) {
  return new Date(`${monthKey}-01T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
}

function fillFor(kind) {
  if (kind === 'forecast') return FORECAST_FILL
  return kind === 'current' ? CURRENT_FILL : PAST_FILL
}

function MonthBars({ months, height, baseCurrency, forecast }) {
  const hasHistory = months.some((month) => month.total > 0)
  if (!hasHistory && !forecast) {
    return (
      <div style={{ height }} className="grid place-items-center">
        <p className="font-display text-[19px] text-ink-muted">None yet!</p>
      </div>
    )
  }

  const data = months.map((month, index) => ({
    label: monthShortLabel(month.monthKey),
    total: month.total,
    topLabel: compactMoney(month.total, baseCurrency),
    kind: index === months.length - 1 ? 'current' : 'past',
  }))

  if (forecast) {
    data.push({
      label: monthShortLabel(forecast.monthKey),
      total: [forecast.low, forecast.high],
      topLabel: `${compactMoney(forecast.low, baseCurrency)}–${compactMoney(
        forecast.high,
        baseCurrency
      )}`,
      kind: 'forecast',
    })
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#82796a', fontSize: 12 }}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell
              key={entry.label}
              fill={fillFor(entry.kind)}
              stroke={entry.kind === 'forecast' ? FORECAST_STROKE : undefined}
              strokeDasharray={entry.kind === 'forecast' ? FORECAST_DASH : undefined}
            />
          ))}
          <LabelList
            dataKey="topLabel"
            position="top"
            style={{ fill: '#645c50', fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default MonthBars

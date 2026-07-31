import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { compactMoney } from '../currencies'

const PAST_FILL = '#eddcae'
const CURRENT_FILL = '#cd8a36'
const FORECAST_FILL = '#fcf2d7'
const FORECAST_STROKE = '#cd8a36'
const FORECAST_DASH = '3 2.5'
const AXIS_LINE = '#b7a9a9'
const GRID_LINE = '#e6ddd9'
const TICK_INK = '#574a4a'
const AXIS_FONT = { fontSize: 11, fontFamily: 'Figtree, system-ui, sans-serif' }

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
      <BarChart data={data} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_LINE} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          axisLine={{ stroke: AXIS_LINE }}
          tickLine={{ stroke: AXIS_LINE }}
          tick={{ fill: TICK_INK, ...AXIS_FONT }}
        />
        <YAxis
          width={54}
          axisLine={{ stroke: AXIS_LINE }}
          tickLine={{ stroke: AXIS_LINE }}
          tick={{ fill: TICK_INK, ...AXIS_FONT }}
          tickFormatter={(value) => compactMoney(value, baseCurrency)}
        />
        <Bar dataKey="total" radius={[3, 3, 0, 0]} isAnimationActive={false}>
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
            style={{ fill: '#2a1f1f', fontWeight: 600, ...AXIS_FONT }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default MonthBars

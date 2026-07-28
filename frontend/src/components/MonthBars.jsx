import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from 'recharts'
import { compactMoney } from '../currencies'

function MonthBars({ months, height, baseCurrency }) {
  const data = months.map((month) => ({
    label: new Date(`${month.monthKey}-01T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short',
      timeZone: 'UTC',
    }),
    total: month.total,
  }))

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
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={index === data.length - 1 ? '#cd8a36' : '#eddcae'} />
          ))}
          <LabelList
            dataKey="total"
            position="top"
            formatter={(value) => compactMoney(value, baseCurrency)}
            style={{ fill: '#645c50', fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default MonthBars

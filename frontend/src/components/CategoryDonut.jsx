import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { categoryColor } from '../categoryColors'
import { formatMoney } from '../currencies'

function CategoryDonut({ slices, total, size, centerLabel, baseCurrency }) {
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="amount"
            nameKey="name"
            innerRadius="58%"
            outerRadius="89%"
            startAngle={90}
            endAngle={-270}
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {slices.map((slice) => (
              <Cell key={slice.name} fill={categoryColor(slice.name).solid} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatMoney(value, baseCurrency)}
            contentStyle={{
              background: '#ffffff',
              border: '1px solid rgba(32,30,29,0.1)',
              borderRadius: 16,
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
        <div>
          <p className="font-display" style={{ fontSize: size > 200 ? 28 : 22 }}>
            {formatMoney(total, baseCurrency)}
          </p>
          <p className="text-[11px] text-ink-muted">{centerLabel}</p>
        </div>
      </div>
    </div>
  )
}

export default CategoryDonut

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { categoryColor } from '../categoryColors'
import { compactMoney, formatMoney } from '../currencies'

const INNER_RADIUS_RATIO = 0.62
const DISPLAY_CHAR_WIDTH_EM = 0.58
const MIN_CENTER_FONT = 11

function fittedFontSize(text, size) {
  const availableWidth = size * INNER_RADIUS_RATIO * 0.88
  const maxFont = size > 200 ? 28 : 22
  return Math.min(maxFont, availableWidth / (Math.max(text.length, 1) * DISPLAY_CHAR_WIDTH_EM))
}

function centerTotal(total, size, baseCurrency) {
  const full = formatMoney(total, baseCurrency)
  if (fittedFontSize(full, size) >= MIN_CENTER_FONT) {
    return { text: full, fontSize: fittedFontSize(full, size) }
  }
  const short = compactMoney(total, baseCurrency)
  return {
    text: short,
    fontSize: Math.max(MIN_CENTER_FONT, fittedFontSize(short, size)),
  }
}

function CategoryDonut({ slices, total, size, centerLabel, baseCurrency }) {
  const { text: totalText, fontSize: totalFontSize } = centerTotal(total, size, baseCurrency)

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="amount"
            nameKey="name"
            innerRadius={`${INNER_RADIUS_RATIO * 100}%`}
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
        <div style={{ maxWidth: size * INNER_RADIUS_RATIO * 0.94 }}>
          <p
            className="font-display whitespace-nowrap leading-tight"
            style={{ fontSize: totalFontSize }}
            title={formatMoney(total, baseCurrency)}
          >
            {totalText}
          </p>
          <p className="text-[11px] text-ink-muted leading-tight mt-0.5 truncate">{centerLabel}</p>
        </div>
      </div>
    </div>
  )
}

export default CategoryDonut

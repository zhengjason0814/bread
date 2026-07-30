const GREETINGS = [
  { until: 12, prefix: 'Rise and shine, ', suffix: '!' },
  { until: 18, prefix: 'Fresh out the oven, ', suffix: '!' },
  { until: 24, prefix: 'Time to loaf around, ', suffix: '!' },
]

export function greetingParts(name, date = new Date()) {
  const hour = date.getHours()
  const match = GREETINGS.find((entry) => hour < entry.until) ?? GREETINGS[GREETINGS.length - 1]
  return { prefix: match.prefix, name, suffix: match.suffix }
}

export function timeOfDayGreeting(name, date = new Date()) {
  const { prefix, suffix } = greetingParts(name, date)
  return `${prefix}${name}${suffix}`
}

export function displayName(email, name) {
  const chosen = String(name || '').trim()
  if (chosen) return chosen
  const local = String(email || '').split('@')[0]
  if (!local) return 'there'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

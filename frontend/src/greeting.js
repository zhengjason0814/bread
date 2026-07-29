export function timeOfDayGreeting(name, date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return `Rise and shine, ${name}!`
  if (hour < 18) return `Fresh out the oven, ${name}!`
  return `Time to loaf around, ${name}!`
}

export function displayName(email) {
  const local = String(email || '').split('@')[0]
  if (!local) return 'there'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

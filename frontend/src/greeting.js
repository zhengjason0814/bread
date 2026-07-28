export function timeOfDayGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
}

export function displayName(email) {
  const local = String(email || '').split('@')[0]
  if (!local) return 'there'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

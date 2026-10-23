const mentoringTimeZone = 'Europe/London'

function getDateParts(date, timeZone = mentoringTimeZone) {
  const values = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  return Object.fromEntries(values.map(({ type, value }) => [type, value]))
}

export function dateTimeLocalToLondonIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null

  const [, year, month, day, hour, minute] = match
  const targetUtc = Date.UTC(+year, +month - 1, +day, +hour, +minute)
  let timestamp = targetUtc

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getDateParts(new Date(timestamp))
    const displayedAsUtc = Date.UTC(
      +parts.year,
      +parts.month - 1,
      +parts.day,
      +parts.hour,
      +parts.minute
    )
    const adjustment = targetUtc - displayedAsUtc
    timestamp += adjustment
    if (adjustment === 0) break
  }

  const check = getDateParts(new Date(timestamp))
  if (
    check.year !== year ||
    check.month !== month ||
    check.day !== day ||
    check.hour !== hour ||
    check.minute !== minute
  ) {
    return null
  }

  return new Date(timestamp).toISOString()
}

export function isoToLondonDateTimeLocal(value) {
  if (!value) return ''
  const parts = getDateParts(new Date(value))
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

export function formatLondonDateTime(value) {
  if (!value) return 'Not scheduled'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: mentoringTimeZone,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value))
}

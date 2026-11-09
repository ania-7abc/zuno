const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function startOfDay(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function daysAgo(date, now) {
  return Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)
}

export function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatChatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()

  if (sameDay(date, now)) return formatTime(timestamp)
  if (daysAgo(date, now) === 1) return 'Yesterday'
  if (daysAgo(date, now) < 7) return WEEKDAYS[date.getDay()]

  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  return date.getFullYear() === now.getFullYear()
    ? `${month} ${day}`
    : `${month} ${day}, ${date.getFullYear()}`
}

export function formatDateLabel(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()

  if (sameDay(date, now)) return 'Today'
  if (daysAgo(date, now) === 1) return 'Yesterday'
  if (daysAgo(date, now) < 7) return WEEKDAYS[date.getDay()]

  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  return date.getFullYear() === now.getFullYear()
    ? `${month} ${day}`
    : `${month} ${day}, ${date.getFullYear()}`
}

export function formatLastSeen(timestamp) {
  if (!timestamp) return 'Offline'

  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60_000) return 'Last seen just now'
  if (diff < 60 * 60_000) {
    const minutes = Math.floor(diff / 60_000)
    return `Last seen ${minutes}m ago`
  }
  if (sameDay(date, now)) return `Last seen today at ${formatTime(timestamp)}`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(date, yesterday)) return `Last seen yesterday at ${formatTime(timestamp)}`

  return `Last seen ${MONTHS[date.getMonth()]} ${date.getDate()}`
}

export function truncate(text, length = 80) {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

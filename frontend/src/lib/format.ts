export function formatFoodName(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toLocaleUpperCase())
}

export function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date indisponible'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function formatNumber(value: number | undefined, digits = 0) {
  if (value === undefined || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits }).format(value)
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`
  return `${(bytes / (1024 * 1024)).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`
}

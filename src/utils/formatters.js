export const formatJPY = (amount) =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)

export const generateDates = (startDate, numDays) =>
  Array.from({ length: numDays }).map((_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

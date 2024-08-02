const numFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true
})

export const fmtNum = (value: number | string): string => numFormatter.format(Number(value))

export const fmtTime = (value: string): string => {
  const date = new Date(value)
  const formattedDate = dateFormatter.format(date)
  const formattedTime = timeFormatter.format(date)
  return `${formattedDate}, ${formattedTime}`
}

export const fmrHr = (value: number): string => {
  if (value < 24) {
    return `${value} hr`
  }

  if (value % 24 === 0) {
    return `${Math.floor(value / 24)} day`
  }

  return `${Math.floor(value / 24)} day ${value % 24} hr`
}

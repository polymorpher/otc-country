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

export const formatSeconds = (seconds: number): string => {
  const min = Math.floor((seconds % 3600) / 60)
  const hour = Math.floor(seconds / 3600)
  const sec = seconds % 60

  return [
    [hour, 'hour'],
    [min, 'minute'],
    [sec, 'second']
  ]
    .filter(([val]) => Number(val) > 0)
    .map(([val, unit]) => `${val} ${unit}`.concat(Number(val) > 1 ? 's' : ''))
    .join(' ')
}

export const abbreviateAddress = (
  address: string,
  startChars = 6,
  endChars = 4
): string => {
  if (address.length <= startChars + endChars) {
    return address
  }

  const start = address.slice(0, startChars)
  const end = address.slice(-endChars)
  return `${start}...${end}`
}

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 9 })

export const fmtNum = (value: number): string => formatter.format(value)

export const fmrHr = (value: number): string => {
  if (value < 24) {
    return `${value} hr`
  }

  if (value % 24 === 0) {
    return `${Math.floor(value / 24)} day`
  }

  return `${Math.floor(value / 24)} day ${value % 24} hr`
}

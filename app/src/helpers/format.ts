export const fmrHr = (value: number): string => {
  if (value < 24) {
    return `${value} hr`
  }

  if (value % 24 === 0) {
    return `${Math.floor(value / 24)} day`
  }

  return `${Math.floor(value / 24)} day ${value % 24} hr`
}

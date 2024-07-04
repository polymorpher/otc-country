const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 9 })

export const fmtNum = (value: number): string => formatter.format(value)

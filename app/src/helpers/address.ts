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

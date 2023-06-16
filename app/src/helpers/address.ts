export const shortenAddress = (address: string, length = 20) =>
  address.slice(0, 2 + Math.floor((length - 5) / 2)).concat('...', address.slice(-Math.floor((length - 5) / 2)));

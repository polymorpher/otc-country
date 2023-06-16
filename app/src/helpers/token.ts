export const divideByDecimals = (value: bigint, decimals: number) =>
  Number((value * 1000n) / BigInt(10 ** decimals)) / 1000;

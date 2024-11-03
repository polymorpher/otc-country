import * as config from '~/helpers/config'

export const host = config.TEST
  ? 'sepolia.etherscan.io'
  : 'explorer.harmony.one'

export const hashLink = (hash: string): string => `https://${host}/tx/${hash}`

import { harmonyOne, localhost } from '@wagmi/core/chains'
import * as CONFIG from './config'
import { type Chain } from '@wagmi/core'

const harmonyChain: Chain = {
  ...harmonyOne,
  rpcUrls: {
    public: { http: ['https://rpc.ankr.com/harmony'] },
    default: { http: ['https://rpc.ankr.com/harmony'] }
  }
}

// const chain = CONFIG.prod ? harmonyChain : localhost
const chain = harmonyChain

export const host = 'explorer.harmony.one'

export const hashLink = (hash: string): string => `https://${host}/tx/${hash}`

export default chain

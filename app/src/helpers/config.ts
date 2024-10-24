import { http, createConfig } from 'wagmi'
import { harmonyOne, sepolia } from 'wagmi/chains'
import chain from './chain'

export const debounceTimeout = 500

// mantisa precision to render values in UI
export const mantisaPrecision = 3

export const config = createConfig({
  chains: [chain],
  transports: {
    [harmonyOne.id]: http('https://rpc.ankr.com/harmony'),
    [sepolia.id]: http()
  }
})

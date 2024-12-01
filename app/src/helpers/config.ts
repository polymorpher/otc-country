import { http, createConfig } from 'wagmi'
import { harmonyOne, sepolia, anvil } from 'wagmi/chains'

export const debounceTimeout = 500

// mantisa precision to render values in UI
export const mantisaPrecision = 3

export const TLD = import.meta.env.VITE_TLD

export const THEGRAPH = import.meta.env.VITE_THEGRAPH

export const OTC_ADDRESS = import.meta.env.VITE_OTC_ADDRESS

export const chain = import.meta.env.VITE_TEST ? sepolia : harmonyOne

export const config = createConfig({
  chains: [chain],
  transports: {
    [harmonyOne.id]: http(
      import.meta.env.VITE_HARMONY_RPC ?? 'https://api.harmony.one'
    ),
    [sepolia.id]: http(),
    [anvil.id]: http('http://127.0.0.1:8545')
  }
})

export const ADDITIONAL_ASSETS = JSON.parse(
  import.meta.env.VITE_ADDITIONAL_ASSETS || '[]'
)

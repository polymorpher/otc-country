import { http, createConfig } from 'wagmi'
import { harmonyOne, sepolia, localhost } from 'wagmi/chains'
import { type Address } from 'abitype'

export const debounceTimeout = 500

// mantisa precision to render values in UI
export const mantisaPrecision = 3

export const TLD = import.meta.env.VITE_TLD
export const LOCAL_TARGET = import.meta.env.VITE_LOCAL_TARGET === '1'

export const THEGRAPH = import.meta.env.VITE_THEGRAPH

export const OTC_ADDRESS = import.meta.env.VITE_OTC_ADDRESS

export const chain = import.meta.env.VITE_TEST ? localhost : harmonyOne

export const config = createConfig({
  chains: [chain],
  transports: {
    [harmonyOne.id]: http(
      import.meta.env.VITE_HARMONY_RPC ?? 'https://api.harmony.one'
    ),
    [sepolia.id]: http(),
    [localhost.id]: http('http://127.0.0.1:8545')
  }
})

export const ADDITIONAL_ASSETS = JSON.parse(
  import.meta.env.VITE_ADDITIONAL_ASSETS || '[]'
)
export const RESOLVE_UNKNOWN_ASSET: Record<
  Address,
  { decimals: number; name: string }
> = JSON.parse(import.meta.env.VITE_RESOLVE_UNKNOWN_ASSET || '{}')

for (const [address, value] of Object.entries(RESOLVE_UNKNOWN_ASSET)) {
  RESOLVE_UNKNOWN_ASSET[address.toLowerCase() as Address] = value as {
    decimals: number
    name: string
  }
}

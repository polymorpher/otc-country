import { harmonyOne, sepolia } from 'wagmi/chains'

const chain = import.meta.env.PROD ? harmonyOne : sepolia

export const host = 'explorer.harmony.one'

export const hashLink = (hash: string): string => `https://${host}/tx/${hash}`

export default chain

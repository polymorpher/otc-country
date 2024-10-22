import { harmonyOne, sepolia } from 'wagmi/chains'

const chain = import.meta.env.TEST ? sepolia : harmonyOne

export const host = import.meta.env.TEST ? 'sepolia.etherscan.io' : 'explorer.harmony.one'

export const hashLink = (hash: string): string => `https://${host}/tx/${hash}`

export default chain

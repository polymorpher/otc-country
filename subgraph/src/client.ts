import { http, createPublicClient } from 'viem'
import dotenv from 'dotenv'

dotenv.config()

const publicClient = createPublicClient({
  cacheTime: 0,
  transport: http(process.env.RPC_URL)
})

export default publicClient

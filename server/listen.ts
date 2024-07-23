import fs from "fs"
import dotenv from "dotenv"
import { http, createPublicClient, Address, parseAbi } from 'viem'
import pool from "./pg"
import OFFER_ABI from '../contract/artifacts/contracts/Offer.sol/Offer.json'
import getPrice from "./price"

dotenv.config()

const SAVE_FILE_PATH = '.otc'

const BLOCK_INTERVAL = 3

const publicClient = createPublicClient({
  cacheTime: 0,
  transport: http(process.env.RPC_URL),
})

const timestampCache: Record<number, number> = {}

const getTimestamp = async (blockNumber: number) => {
  if (timestampCache[blockNumber] === undefined) {
    const block = await publicClient.getBlock({ blockNumber: BigInt(blockNumber) })
    timestampCache[blockNumber] = Number(block.timestamp)
  }

  return timestampCache[blockNumber]
}

const listen = async () => {
  let lastBlockNumber = 0

  if (fs.existsSync(SAVE_FILE_PATH)) {
    lastBlockNumber = Number(fs.readFileSync(SAVE_FILE_PATH))
  }

  if (lastBlockNumber === 0) {
    lastBlockNumber = Number(await publicClient.getBlockNumber())
  }

  console.log(`start: ${lastBlockNumber}`)

  setInterval(async () => {
    try {
      const blockNumber = Number(await publicClient.getBlockNumber())

      console.log(`block number: ${blockNumber}`)

      if (blockNumber - BLOCK_INTERVAL < lastBlockNumber) {
        console.log(`skipping ${blockNumber}`)
        return
      }

      console.log(`block number: from ${lastBlockNumber} to ${blockNumber}`)

      const [offerCreatedFilter, offerAcceptedFilter] = await Promise.all([
        publicClient.createContractEventFilter({
          abi: parseAbi(['event OfferCreated(string indexed domainName, address indexed srcAsset, address indexed destAsset, address offerAddress, address domainOwner, uint256 depositAmount, uint256 closeAmount, uint256 commissionRate, uint256 lockWithdrawAfter)']),
          address: String(process.env.OTC_CONTRACT) as Address,
          fromBlock: BigInt(lastBlockNumber),
          toBlock: BigInt(blockNumber),
          eventName: 'OfferCreated'
        }),

        publicClient.createContractEventFilter({
          abi: OFFER_ABI.abi,
          fromBlock: BigInt(lastBlockNumber),
          toBlock: BigInt(blockNumber),
          eventName: 'OfferAccepted'
        })
      ])

      const [createdLogs, acceptedLogs] = await Promise.all([
        publicClient.getFilterLogs({ filter: offerCreatedFilter }),
        publicClient.getFilterLogs({ filter: offerAcceptedFilter })
      ])

      for (const log of createdLogs) {
        if (log.eventName === 'OfferCreated') {
          const [srcPrice, destPrice, time] = await Promise.all([
            getPrice(log.args.srcAsset!),
            getPrice(log.args.destAsset!),
            getTimestamp(Number(log.blockNumber))
          ])

          await pool.query(`
            INSERT INTO
              logs(event_name, time, domain_name, src_asset, dest_asset, offer_address, domain_owner, close_amount, total_deposits, src_price, dest_price)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            'OfferCreated',
            time,
            log.args.domainName,
            String(log.args.srcAsset).toLowerCase(),
            String(log.args.destAsset).toLowerCase(),
            String(log.args.offerAddress).toLowerCase(),
            String(log.args.domainOwner).toLowerCase(),
            log.args.closeAmount,
            log.args.depositAmount,
            srcPrice,
            destPrice,
          ])
        }
      }

      for (const log of acceptedLogs) {
        const [domainName, srcAsset, destAsset, domainOwner, closeAmount, totalDeposits] = await Promise.all(
          ['domainName', 'srcAsset', 'destAsset', 'domainOwner', 'acceptAmount', 'total_deposits']
            .map((func) => publicClient.readContract({
              address: log.address,
              abi: OFFER_ABI.abi,
              functionName: func
            }))
        )

        const [srcPrice, destPrice, time] = await Promise.all([
          getPrice(String(srcAsset)),
          getPrice(String(destAsset)),
          getTimestamp(Number(log.blockNumber))
        ])

        await pool.query(`
          INSERT INTO
            logs(event_name, time, domain_name, src_asset, dest_asset, offer_address, domain_owner, close_amount, total_deposits, src_price, dest_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          'OfferAccepted',
          time,
          domainName,
          String(srcAsset).toLowerCase(),
          String(destAsset).toLowerCase(),
          String(log.address).toLowerCase(),
          String(domainOwner).toLowerCase(),
          closeAmount,
          totalDeposits,
          srcPrice,
          destPrice,
        ])
      }

      lastBlockNumber = blockNumber + 1
      console.log(`last block number: ${lastBlockNumber}`)
      fs.writeFileSync(SAVE_FILE_PATH, String(lastBlockNumber))
    } catch (error) {
      console.error(`error: ${JSON.stringify(error)}`)
    }
  }, 5000)
}

listen()

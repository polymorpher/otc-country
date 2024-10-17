import fs from 'fs'
import dotenv from 'dotenv'
import { http, createPublicClient, type Address, parseAbi } from 'viem'
import pool from './pg.js'
import OFFER_ABI from '../contract/artifacts/contracts/Offer.sol/Offer.json'
import { getPrice } from '../app/src/helpers/assets.js'

dotenv.config()

const SAVE_FILE_PATH = '.otc'

const BLOCK_INTERVAL = 3

const publicClient = createPublicClient({
  cacheTime: 0,
  transport: http(process.env.RPC_URL)
})

const timestampCache: Record<number, number> = {}

const getTimestamp = async (blockNumber: number): Promise<number> => {
  if (timestampCache[blockNumber] === undefined) {
    const block = await publicClient.getBlock({ blockNumber: BigInt(blockNumber) })
    timestampCache[blockNumber] = Number(block.timestamp) * 1000
  }

  return timestampCache[blockNumber]
}

const listen = async (): Promise<void> => {
  let lastBlockNumber = 0

  if (fs.existsSync(SAVE_FILE_PATH)) {
    lastBlockNumber = Number(fs.readFileSync(SAVE_FILE_PATH))
  }

  if (lastBlockNumber === 0) {
    lastBlockNumber = Number(await publicClient.getBlockNumber())
  }

  console.log(`start: ${lastBlockNumber}`)

  // should be var, not let, as interval callback should access updated value
  let lastBlockNumberBeingProcessed = 0

  setInterval(async () => {
    try {
      const blockNumber = Number(await publicClient.getBlockNumber())

      console.log(`block number: ${blockNumber}`)

      if (blockNumber - BLOCK_INTERVAL < lastBlockNumberBeingProcessed) {
        console.log(`skipping ${blockNumber}`)
        return
      }

      console.log(`block number: from ${lastBlockNumber} to ${blockNumber}`)

      lastBlockNumberBeingProcessed = blockNumber + 1

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

          try {
            await pool.query(`
              INSERT INTO
                logs(event_name, time, src_asset, dest_asset, offer_address, domain_name, domain_owner, close_amount, total_deposits, src_price, dest_price)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
              'OfferCreated',
              new Date(time).toUTCString(),
              String(log.args.srcAsset).toLowerCase(),
              String(log.args.destAsset).toLowerCase(),
              String(log.args.offerAddress).toLowerCase(),
              String(log.args.domainName).toLowerCase(),
              String(log.args.domainOwner).toLowerCase(),
              log.args.closeAmount,
              log.args.depositAmount,
              srcPrice,
              destPrice
            ])
          } catch (e) {
            console.log(`error while adding created event to db: ${JSON.stringify(e)}`)
          }
        }
      }

      for (const log of acceptedLogs) {
        const [srcAsset, destAsset, domainOwner, closeAmount, totalDeposits, domainName] = await Promise.all(
          ['srcAsset', 'destAsset', 'domainOwner', 'acceptAmount', 'totalDeposits', 'domainName']
            .map(async (func) => await publicClient.readContract({
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

        try {
          await pool.query(`
            INSERT INTO
              logs(event_name, time, src_asset, dest_asset, offer_address, domain_name, domain_owner, close_amount, total_deposits, src_price, dest_price)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            'OfferAccepted',
            new Date(time).toUTCString(),
            String(srcAsset).toLowerCase(),
            String(destAsset).toLowerCase(),
            String(log.address).toLowerCase(),
            domainName,
            String(domainOwner).toLowerCase(),
            closeAmount,
            totalDeposits,
            srcPrice,
            destPrice
          ])
        } catch (e) {
          console.log(`error while adding accepted event to db: ${JSON.stringify(e)}`)
        }
      }

      lastBlockNumber = blockNumber + 1
      console.log(`last block number: ${lastBlockNumber}`)
      fs.writeFileSync(SAVE_FILE_PATH, String(lastBlockNumber))
    } catch (error) {
      console.error(`error: ${JSON.stringify(error)}`)
    }
  }, 5000)
}

listen().catch(console.error)

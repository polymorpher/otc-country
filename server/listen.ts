import fs from "fs"
import dotenv from "dotenv"
import { http, createPublicClient, Address } from 'viem'
import { Datastore } from "@google-cloud/datastore"
import OTC_ABI from '../contract/artifacts/contracts/OTC.sol/OTC.json'
import OFFER_ABI from '../contract/artifacts/contracts/Offer.sol/Offer.json'

dotenv.config()

const SAVE_FILE_PATH = '.otc'

const BLOCK_INTERVAL = 3

const datastore = new Datastore()

export const publicClient = createPublicClient({
  cacheTime: 0,
  transport: http(process.env.RPC_URL),
})

const listen = async () => {
  const kind = 'events';
  const name = 'sampletask1';
  const taskKey = datastore.key([kind, name]);
  const task = {
    key: taskKey,
    data: {
      description: 'Buy milk',
    },
  }

  await datastore.save(task)

  console.log("SSSS")

  return

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

      const offerCreatedFilter = await publicClient.createContractEventFilter({
        abi: OTC_ABI.abi,
        address: String(process.env.OTC_CONTRACT) as Address,
        fromBlock: BigInt(lastBlockNumber),
        toBlock: BigInt(blockNumber),
      })

      const offerAcceptedFilter = await publicClient.createContractEventFilter({
        abi: OFFER_ABI.abi,
        fromBlock: BigInt(lastBlockNumber),
        toBlock: BigInt(blockNumber),
        eventName: 'OfferAccepted'
      })

      const createdLogs = await publicClient.getFilterLogs({ filter: offerCreatedFilter })
      const acceptedLogs = await publicClient.getFilterLogs({ filter: offerAcceptedFilter })

      for (const log of createdLogs) {
        if (log.eventName === 'OfferCreated') {
          // log.args.domainName
          // log.args.srcAsset
          // log.args.destAsset
          // log.args.offerAddress
          // log.args.domainOwner
          // log.args.closeAmount
        }
      }

      for (const log of acceptedLogs) {
        const [domainName, srcAsset, destAsset, domainOwner, totalDeposits, acceptAmount] = await Promise.all(
          ['domainName', 'srcAsset', 'destAsset', 'domainOwner', 'totalDeposits', 'acceptAmount']
            .map((func) => publicClient.readContract({
              address: log.address,
              abi: OFFER_ABI,
              functionName: func
            }))
        )
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

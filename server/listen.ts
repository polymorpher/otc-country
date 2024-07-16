import fs from "fs"
import dotenv from "dotenv"
import { http, createPublicClient, Address, parseAbi } from 'viem'
import { Firestore } from "@google-cloud/firestore"
import OFFER_ABI from '../contract/artifacts/contracts/Offer.sol/Offer.json'

dotenv.config()

const SAVE_FILE_PATH = '.otc'

const BLOCK_INTERVAL = 3

const firestore = new Firestore();

const collection = firestore.collection('events');

const doc = collection.doc('logs');

const publicClient = createPublicClient({
  cacheTime: 0,
  transport: http(process.env.RPC_URL),
})

const timestampCache: Record<number, number> = {}

const getTimestamp = async (blockNumber: number) => {
  if (timestampCache[blockNumber] === undefined) {
    timestampCache[blockNumber] = Number(await publicClient.getBlock({ blockNumber: BigInt(blockNumber) }))
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
          doc.set({
            eventName: 'OfferCreated',
            time: getTimestamp(Number(log.blockNumber)),
            domainName: log.args.domainName,
            srcAsset: log.args.srcAsset,
            destAsset: log.args.destAsset,
            offerAddress: log.args.offerAddress,
            domainOwner: log.args.domainOwner,
            closeAmount: log.args.closeAmount,
          })
        }
      }

      for (const log of acceptedLogs) {
        const [domainName, srcAsset, destAsset, domainOwner, closeAmount] = await Promise.all(
          ['domainName', 'srcAsset', 'destAsset', 'domainOwner', 'acceptAmount']
            .map((func) => publicClient.readContract({
              address: log.address,
              abi: OFFER_ABI.abi,
              functionName: func
            }))
        )

        doc.set({
          eventName: 'OfferAccepted',
          offerAddress: log.address,
          time: getTimestamp(Number(log.blockNumber)),
          domainName,
          srcAsset,
          destAsset,
          domainOwner,
          closeAmount,
        })
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

import { Address, erc20Abi  } from 'viem'
import { v4 as uuidv4 } from 'uuid'
import { Asset, Event, Query } from '../types/schema'
import { getAssetByAddress } from '../app/src/helpers/assets.js'
import publicClient from './client.js'
import { Bytes, ethereum } from '@graphprotocol/graph-ts'


export const getOrCreateAsset = async (address: Address) => {
  const asset = Asset.load(address)

  if (asset) {
    return asset
  }

  const newAsset = new Asset(address)

  newAsset.id = address
  newAsset.address = Bytes.fromHexString(address)
  newAsset.label = getAssetByAddress(address)?.label ?? "Unknown"
  newAsset.decimals = await publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'decimals',
  })

  return newAsset
}

export const generateEvent = (event: ethereum.Event) => {
  const e = new Event(uuidv4())

  e.blockNumber = event.block.number
  e.txHash = event.transaction.hash
  e.timestamp = event.block.timestamp

  return e
}

const QUERY_ID = 'query'

export const getQuery = () => Query.load(QUERY_ID) ?? new Query(QUERY_ID)

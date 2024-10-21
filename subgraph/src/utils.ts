import { Bytes, ethereum } from '@graphprotocol/graph-ts'
import { Asset, Event } from '../types/schema'
import { getAssetByAddress } from '../../app/src/helpers/assets'


export const getOrCreateAsset = (address: string) => {
  const addr = Bytes.fromUTF8(address)
  const asset = Asset.load(addr)

  if (asset) {
    return asset
  }

  const newAsset = new Asset(addr)
  const val = getAssetByAddress(address)

  newAsset.address = Bytes.fromHexString(address)
  newAsset.label = val ? val.label : 'Unknown'

  return newAsset
}

export const generateEvent = (event: ethereum.Event) => {
  const e = new Event(Bytes.fromUTF8(`${event.block}-${event.logIndex}`))

  e.blockNumber = event.block.number
  e.txHash = event.transaction.hash
  e.timestamp = event.block.timestamp

  return e
}

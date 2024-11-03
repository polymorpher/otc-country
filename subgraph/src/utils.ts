import { Bytes, ethereum } from '@graphprotocol/graph-ts'
import { Asset, Event } from '../types/schema'
import { Asset as AssetType, DEPEGGED, ASSETS } from '../../app/src/helpers/assets'


export const getAssetByAddress = (address: string): AssetType => {
  const assets = DEPEGGED.concat(ASSETS)

  for (let i = 0; i < assets.length; i++) {
    if (assets[i].value.toLowerCase() === address.toLowerCase()) {
      return assets[i]
    }
  }

  return new AssetType(
    address,
    'Unknown',
    'https://icons.veryicon.com/png/o/miscellaneous/basic-icon-1/unknown-18.png',
    '0'
  )
}

export const getOrCreateAsset = (address: string): Asset => {
  const addr = Bytes.fromHexString(address)
  const asset = Asset.load(addr)

  if (asset) {
    return asset
  }

  const newAsset = new Asset(addr)
  const val = getAssetByAddress(address)

  newAsset.address = addr
  newAsset.label = val.label

  return newAsset
}

export const generateEvent = (event: ethereum.Event): Event => {
  const e = new Event(Bytes.fromUTF8(`${event.block.number}-${event.logIndex}`))

  e.blockNumber = event.block.number
  e.txHash = event.transaction.hash
  e.timestamp = event.block.timestamp

  return e
}

import { Bytes } from '@graphprotocol/graph-ts'
import {ERC20Mock as ERC20Contract} from '../types/OTC/ERC20Mock'
import { OfferCreated as OfferCreatedEvent } from '../types/OTC/OTC'
import { Offer as OfferContract, OfferAccepted as OfferAcceptedEvent } from '../types/Offer/Offer'
import { Offer } from '../types/schema'
import { generateEvent, getOrCreateAsset, getAssetByAddress } from './utils'


const getPrice = (address: string): i32 => {
  const asset = getAssetByAddress(address)
  const rate = asset.rate

  if (!rate.startsWith('0x')) {
    return i32(parseInt(rate))
  }

  return 0
}

export function handleOfferCreated(event: OfferCreatedEvent): void {
  const sourceAssetAddress = event.params.srcAsset.toHexString()
  const destAssetAddress = event.params.destAsset.toHexString()
  const sourceAssetContract = ERC20Contract.bind(event.params.srcAsset)
  const destAssetContract = ERC20Contract.bind(event.params.destAsset)
  const sourceAsset = getOrCreateAsset(sourceAssetAddress, sourceAssetContract.decimals())
  const destAsset = getOrCreateAsset(destAssetAddress, destAssetContract.decimals())
  const offerContract = OfferContract.bind(event.params.offerAddress)

  const domainName = offerContract.domainName()
  const offer = new Offer(Bytes.fromUTF8(domainName))
  const e = generateEvent(event)
    
  e.type = 'CREATED'
  e.offer = offer.id
  e.sourceAssetPrice = getPrice(sourceAssetAddress)
  e.destAssetPrice = getPrice(destAssetAddress)
  e.save()

  offer.domainName = domainName
  offer.sourceAsset = sourceAsset.id
  offer.destAsset = destAsset.id
  offer.offerAddress = event.params.offerAddress
  offer.domainOwner = event.params.domainOwner
  offer.closeAmount = event.params.closeAmount
  offer.commissionRate = event.params.commissionRate
  offer.lockWithdrawAfter = event.params.lockWithdrawAfter
  offer.totalDeposits = event.params.depositAmount
  offer.depositHistory = [event.params.depositAmount]

  offer.save()
}

export function handleOfferAccepted(event: OfferAcceptedEvent): void {
  const offerContract = OfferContract.bind(event.address)
  const id = Bytes.fromUTF8(offerContract.domainName())
  const offer = Offer.load(id)

  if (!offer) {
    return
  }

  const e = generateEvent(event)

  e.type = 'ACCEPTED'
  e.offer = offer.id
  e.sourceAssetPrice = getPrice(offer.sourceAsset.toHex()),
  e.destAssetPrice = getPrice(offer.destAsset.toHex())
  e.save()

  offer.totalDeposits = offerContract.totalDeposits()
  offer.save()
}

// export function handleERC20Mock(e: ref_any): void {}
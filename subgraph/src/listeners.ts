import { Bytes } from '@graphprotocol/graph-ts'
import { ERC20Mock as ERC20Contract } from '../types/ERC20/ERC20Mock'
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
  const sourceAsset = getOrCreateAsset(sourceAssetAddress)
  const destAsset = getOrCreateAsset(destAssetAddress)
  const sourceAssetContract = ERC20Contract.bind(event.params.srcAsset)
  const destAssetContract = ERC20Contract.bind(event.params.destAsset)

  sourceAsset.decimals = sourceAssetContract.decimals()
  destAsset.decimals = destAssetContract.decimals()
  
  sourceAsset.save()
  destAsset.save()

  const domainName = event.params.domainName.toString()
  const offer = new Offer(event.params.domainName)
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
  
  const depositHistory = offer.depositHistory
  depositHistory.push(event.params.depositAmount)
  offer.depositHistory = depositHistory

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
  e.sourceAssetPrice = getPrice(offerContract.srcAsset().toHex()),
  e.destAssetPrice = getPrice(offerContract.destAsset().toHex())
  e.save()

  offer.totalDeposits = offerContract.totalDeposits()
  offer.save()
}

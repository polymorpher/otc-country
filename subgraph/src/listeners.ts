import publicClient from './client'
import OFFER_ABI from '../contract/artifacts/contracts/Offer.sol/Offer.json'
import { getPrice } from '../app/src/helpers/assets'
import { OfferCreated as OfferCreatedEvent } from '../types/OTC/OTC'
import { OfferAccepted as OfferAcceptedEvent } from '../types/Offer/Offer'
import { Offer } from '../types/schema'
import { generateEvent, getOrCreateAsset } from './utils'
import { Address } from 'viem'

enum OfferEvent {
  CREATED = 'CREATED',
  ASSET_DEPOSITED = 'ASSET_DEPOSITED',
  ASSET_WITHDRAWN = 'ASSET_WITHDRAWN',
  CLOSED = 'CLOSED',
  ACCEPTED = 'ACCEPTED',
  PAYMENT_WITHDRAWN = 'PAYMENT_WITHDRAWN'
}

export const handleOfferCreated = async (event: OfferCreatedEvent) => {
  const sourceAssetAddress = event.params.srcAsset.toHexString() as Address
  const destAssetAddress = event.params.destAsset.toHexString() as Address
  const [sourceAsset, destAsset, sourceAssetPrice, destAssetPrice] = await Promise.all([
    getOrCreateAsset(sourceAssetAddress),
    getOrCreateAsset(destAssetAddress),
    getPrice(sourceAssetAddress),
    getPrice(destAssetAddress),
  ])

  const domainName = event.params.domainName.toString()
  const offer = new Offer(domainName)
  const e = generateEvent(event)
    
  e.type = OfferEvent.CREATED
  e.offer = offer.id
  e.sourceAssetPrice = sourceAssetPrice
  e.destAssetPrice = destAssetPrice
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
  offer.depositHistory.push(event.params.depositAmount)
  offer.events.push(e.id)
  offer.save()
}

export const handleOfferAccepted = async (event: OfferAcceptedEvent) => {
  const [
    sourceAssetAddress,
    destAssetAddress,
    domainOwner,
    totalDeposits,
  ] = await Promise.all([
    'srcAsset',
    'destAsset',
    'domainOwner',
    'totalDeposits',
  ].map(func => publicClient.readContract({
    address: event.address,
    abi: OFFER_ABI.abi,
    functionName: func
  })))

  const offer = Offer.load(domainOwner)

  if (!offer) {
    return
  }

  const [sourceAssetPrice, destAssetPrice] = await Promise.all([
    getPrice(sourceAssetAddress),
    getPrice(destAssetAddress),
  ])

  const e = generateEvent(event)

  e.type = OfferEvent.ACCEPTED
  e.offer = offer.id
  e.sourceAssetPrice = sourceAssetPrice
  e.destAssetPrice = destAssetPrice
  e.save()

  offer.totalDeposits = totalDeposits
  offer.events.push(e.id)
  offer.save()
}

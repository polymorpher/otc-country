import { Address, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as/assembly/index'
import { OfferCreated } from '../types/OTC/OTC'
import { OfferAccepted } from '../types/Offer/Offer'

export const mockOfferCreatedEvent = (
  domainName: Address,
  srcAsset: Address,
  destAsset: Address,
  offerAddress: Address,
  domainOwner: Address,
  depositAmount: i32,
  closeAmount: i32,
  commissionRate: i32,
  lockWithdrawAfter: i32
): OfferCreated => {
  const e = newMockEvent()

  const offerCreatedEvent = new OfferCreated(
    e.address,
    e.logIndex,
    e.transactionLogIndex,
    e.logType,
    e.block,
    e.transaction,
    e.parameters,
    e.receipt
  )

  const domainNameParam = new ethereum.EventParam(
    'domainName',
    ethereum.Value.fromAddress(domainName)
  )

  const srcAssetParam = new ethereum.EventParam(
    'srcAsset',
    ethereum.Value.fromAddress(srcAsset)
  )

  const destAssetParam = new ethereum.EventParam(
    'destAsset',
    ethereum.Value.fromAddress(destAsset)
  )

  const offerAddressParam = new ethereum.EventParam(
    'offerAddress',
    ethereum.Value.fromAddress(offerAddress)
  )

  const domainOwnerParam = new ethereum.EventParam(
    'domainOwner',
    ethereum.Value.fromAddress(domainOwner)
  )

  const depositAmountParam = new ethereum.EventParam(
    'depositAmount',
    ethereum.Value.fromI32(depositAmount)
  )

  const closeAmountParam = new ethereum.EventParam(
    'closeAmount',
    ethereum.Value.fromI32(closeAmount)
  )

  const commissionRateParam = new ethereum.EventParam(
    'commissionRate',
    ethereum.Value.fromI32(commissionRate)
  )

  const lockWithdrawAfterParam = new ethereum.EventParam(
    'lockWithdrawAfter',
    ethereum.Value.fromI32(lockWithdrawAfter)
  )

  offerCreatedEvent.parameters = new Array()
  offerCreatedEvent.parameters.push(domainNameParam)
  offerCreatedEvent.parameters.push(srcAssetParam)
  offerCreatedEvent.parameters.push(destAssetParam)
  offerCreatedEvent.parameters.push(offerAddressParam)
  offerCreatedEvent.parameters.push(domainOwnerParam)
  offerCreatedEvent.parameters.push(depositAmountParam)
  offerCreatedEvent.parameters.push(closeAmountParam)
  offerCreatedEvent.parameters.push(commissionRateParam)
  offerCreatedEvent.parameters.push(lockWithdrawAfterParam)

  return offerCreatedEvent
}

export const mockOfferAcceptedEvent = (
  acceptor: Address,
  offer: Address
): OfferAccepted => {
  const e = newMockEvent()

  const offerAcceptedEvent = new OfferAccepted(
    offer,
    e.logIndex,
    e.transactionLogIndex,
    e.logType,
    e.block,
    e.transaction,
    e.parameters,
    e.receipt
  )

  const acceptorParam = new ethereum.EventParam(
    'acceptor',
    ethereum.Value.fromAddress(acceptor)
  )

  offerAcceptedEvent.parameters = new Array()
  offerAcceptedEvent.parameters.push(acceptorParam)

  return offerAcceptedEvent
}

export function randomOfferCreatedEvent(): OfferCreated {
  const domainName = createRandomAddress()
  const srcAsset = createRandomAddress()
  const destAsset = createRandomAddress()
  const offerAddress = createRandomAddress()
  const domainOwner = createRandomAddress()
  const depositAmount = i32(Math.round(Math.random() * 100))
  const closeAmount = i32(Math.round(Math.random() * 100))
  const commissionRate = i32(Math.round(Math.random() * 100))
  const lockWithdrawAfter = i32(Math.round(Math.random() * 100))
 
  return mockOfferCreatedEvent(
    domainName,
    srcAsset,
    destAsset,
    offerAddress,
    domainOwner,
    depositAmount,
    closeAmount,
    commissionRate,
    lockWithdrawAfter
  )
}

export function randomOfferAcceptedEvent(offer: Address): OfferAccepted {
  const acceptor = createRandomAddress()
  return mockOfferAcceptedEvent(acceptor, offer)
}

export const createRandomAddress = (): Address => newMockEvent().address

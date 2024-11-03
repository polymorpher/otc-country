import { assert, createMockedFunction, test } from 'matchstick-as/assembly/index'
import { log } from "matchstick-as/assembly/log";
import { handleOfferAccepted, handleOfferCreated } from '../src/listeners'
import { randomOfferAcceptedEvent, randomOfferCreatedEvent } from './mock'
import { ethereum } from '@graphprotocol/graph-ts'

test('Offer', () => {
  const offerA_CreatedEvent = randomOfferCreatedEvent()
  const offerB_CreatedEvent = randomOfferCreatedEvent()
  const offerA = offerA_CreatedEvent.params.offerAddress
  const offerA_AcceptedEvent = randomOfferAcceptedEvent(offerA)

  createMockedFunction(offerA_CreatedEvent.params.srcAsset, 'decimals', 'decimals():uint8')
    .withArgs([])
    .returns([ethereum.Value.fromI32(8)])

  createMockedFunction(offerA_CreatedEvent.params.destAsset, 'decimals', 'decimals():uint8')
    .withArgs([])
    .returns([ethereum.Value.fromI32(8)])

  createMockedFunction(offerA_CreatedEvent.params.offerAddress, 'totalDeposits', 'totalDeposits():uint256')
    .withArgs([])
    .returns([ethereum.Value.fromI32(99)])

  handleOfferCreated(offerA_CreatedEvent)
  handleOfferCreated(offerB_CreatedEvent)
  handleOfferAccepted(offerA_AcceptedEvent)

  assert.fieldEquals(
    'Offer',
    offerA_CreatedEvent.params.domainName.toHex(),
    'domainName',
     offerA_CreatedEvent.params.domainName.toString()
  )

  assert.entityCount('Offer', 2)
  assert.entityCount('Event', 3)
})

import { gql } from 'graphql-request'

const EVENT_FIELDS = `
  type
  offer {
    domainName
    sourceAsset {
      address
      decimals
      label
    }
    destAsset {
      address
      decimals
      label
    }
    offerAddress
    domainOwner
    depositHistory
    totalDeposits
    closeAmount
    commissionRate
    lockWithdrawAfter
  }
  sourceAssetPrice
  destAssetPrice
  blockNumber
  txHash
  timestamp
`

export const GET_RECENT_EVENTS = gql`
  query GetEvents($recent: Int!) {
    events(first: $recent) {
      ${EVENT_FIELDS}
    }
  }
`

export const GET_ALL_EVENTS = gql`
  query GetEvents {
    events {
      ${EVENT_FIELDS}
    }
  }
`

export const GET_EVENTS_FOR_ASSET = gql`
  query GetEvent($asset: Bytes!) {
    events(where: {
      or: [
        { offer_: { sourceAsset: $asset } },
        { offer_: { destAsset: $asset } }
      ]
    }) {
      ${EVENT_FIELDS}
    }
  }
`

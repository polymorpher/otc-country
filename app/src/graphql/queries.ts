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

export const GET_RECENT_EVENTS = `
  query GetEvents($recent: Int!) {
    events(first: $recent) {
      ${EVENT_FIELDS}
    }
  }
`

export const GET_ALL_EVENTS = `
  query GetEvents {
    events {
      ${EVENT_FIELDS}
    }
  }
`

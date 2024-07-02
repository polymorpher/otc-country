/* eslint no-unused-vars:0 */

export namespace Otc {
  export enum ErrorType {
    ZeroAddress,
    SourceAssetUnregistered,
    DestAssetUnregistered,
    CommissionRateBeyondLimit,
    AssetAlreadyAdded,
    AssetAlreadyRemoved,
  }
}

export namespace Offer {
  export enum ErrorType {
    InsufficientBalance,
    OfferNotOpen,
    OfferAccepted,
    OfferNotAccepted,
    NotCreator,
    NotDomainOwner,
    WithdrawLocked,
  }

  export enum Status {
    Open,
    Accepted,
    Closed,
  }
}

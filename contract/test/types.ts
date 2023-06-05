import { ERC20Mock, OTC } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

export interface TestEnv {
  otc: OTC;
  srcAssets: ERC20Mock[];
  destAssets: ERC20Mock[];
  owner: SignerWithAddress;
  accounts: SignerWithAddress[];
}

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
}

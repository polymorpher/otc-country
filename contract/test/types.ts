import { ERC20Mock, OTC } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"

export interface TestEnv {
  otc: OTC,
  sourceAssets: ERC20Mock[],
  destAssets: ERC20Mock[],
  owner: SignerWithAddress,
  accounts: SignerWithAddress[]
}

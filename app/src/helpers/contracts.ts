import { type Abi, type Address } from 'abitype'
import otcAbi from '~/../../contract/artifacts/contracts/OTC.sol/OTC.json' assert {type: 'json'}
// import ierc20Abi from '~/../../contract/artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json' assert {type: 'json'}
import offerAbi from '~/../../contract/artifacts/contracts/Offer.sol/Offer.json' assert {type: 'json'}
import domainContractAbi from '~/../../contract/artifacts/contracts/mocks/DomainContract.sol/DomainContract.json' assert {type: 'json'}
import erc20Abi from '~/../../contract/artifacts/contracts/mocks/ERC20.sol/ERC20Mock.json' assert {type: 'json'}
import * as CONFIG from './config'

export interface ContractType {
  address: `0x${string}`
  abi: Abi
}
export const otcContract: ContractType = {
  address: CONFIG.otcAddress,
  abi: otcAbi.abi as Abi
}

export const offerContract = (offerAddress: Address): ContractType => ({
  address: offerAddress,
  abi: offerAbi.abi as Abi
})

export const domainContract = (domainContractAddress: Address): ContractType => ({
  address: domainContractAddress,
  abi: domainContractAbi.abi as Abi
})

export const erc20Contract = (erc20Address: Address): ContractType => ({
  address: erc20Address,
  abi: erc20Abi.abi as Abi
})

// export const ierc20Abi

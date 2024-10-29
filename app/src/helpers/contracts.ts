import { type Abi, type Address } from 'abitype'
// eslint-disable-next-line import/no-extraneous-dependencies
import otcAbi from '~/../../contract/artifacts/contracts/OTC.sol/OTC.json' assert { type: 'json' }
// import ierc20Abi from '~/../../contract/artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json' assert {type: 'json'}
// eslint-disable-next-line import/no-extraneous-dependencies
import offerAbi from '~/../../contract/artifacts/contracts/Offer.sol/Offer.json' assert { type: 'json' }
// eslint-disable-next-line import/no-extraneous-dependencies
import idcAbi from '~/../../contract/artifacts/contracts/externals/IDC.sol/IDC.json' assert { type: 'json' }
// eslint-disable-next-line import/no-extraneous-dependencies
import erc20Abi from '~/../../contract/artifacts/contracts/mocks/ERC20.sol/ERC20Mock.json' assert { type: 'json' }

export interface ContractType {
  address: `0x${string}`
  abi: Abi
}

export const otcContract: ContractType = {
  address: import.meta.env.VITE_OTC_ADDRESS,
  abi: otcAbi.abi as Abi
}

export const offerContract = (offerAddress: Address): ContractType => ({
  address: offerAddress,
  abi: offerAbi.abi as Abi
})

export const idcContract = (domainContractAddress: Address): ContractType => ({
  address: domainContractAddress,
  abi: idcAbi.abi as Abi
})

export const erc20Contract = (erc20Address: Address): ContractType => ({
  address: erc20Address,
  abi: erc20Abi.abi as Abi
})

// export const ierc20Abi

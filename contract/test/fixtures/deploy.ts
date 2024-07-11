import { ethers } from 'hardhat'
import {
  DomainContract,
  ERC20Mock,
  OfferFactory,
  OTC
} from '../../typechain-types'

const feePercentage = 4000n // 4 %

const deployFixture = async () => {
  const [admin, operator, revenueAccount, domainOwner, ...accounts] =
    await ethers.getSigners()

  const OfferFactory = await ethers.getContractFactory('OfferFactory')
  const DomainContract = await ethers.getContractFactory('DomainContract')
  const Otc = await ethers.getContractFactory('OTC')
  const Erc20 = await ethers.getContractFactory('ERC20Mock')

  const offerFactory = (await OfferFactory.deploy()) as unknown as OfferFactory
  const domainContract =
    (await DomainContract.deploy()) as unknown as DomainContract
  const otc = (await Otc.deploy(
    domainContract,
    offerFactory,
    admin,
    operator,
    revenueAccount,
    feePercentage
  )) as unknown as OTC

  const sa1 = (await Erc20.deploy(
    'SrcAsset1',
    'SrcAsset2'
  )) as unknown as ERC20Mock

  const sa2 = (await Erc20.deploy(
    'SrcAsset2',
    'SrcAsset2'
  )) as unknown as ERC20Mock
  const da1 = (await Erc20.deploy(
    'DestAsset1',
    'DestAsset1'
  )) as unknown as ERC20Mock

  return {
    otc,
    domainContract,
    srcAssets: [sa1, sa2],
    destAssets: [da1],
    admin,
    operator,
    revenueAccount,
    domainOwner,
    accounts
  }
}

export default deployFixture

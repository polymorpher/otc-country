import { ethers } from 'hardhat'
import { DomainContract, ERC20Mock, OfferFactory, TestOTC } from '../../typechain-types'

const deployFixture = async () => {
  const [owner, domainOwner, ...accounts] = await ethers.getSigners()

  const OfferFactory = await ethers.getContractFactory('OfferFactory')
  const DomainContract = await ethers.getContractFactory('DomainContract')
  const Otc = await ethers.getContractFactory('TestOTC')
  const Erc20 = await ethers.getContractFactory('ERC20Mock')

  const offerFactory = await OfferFactory.deploy() as unknown as OfferFactory
  const domainContract = await DomainContract.deploy() as unknown as DomainContract
  const otc = await Otc.deploy(domainContract, offerFactory) as unknown as TestOTC

  const sa1 = await Erc20.deploy('SrcAsset1', 'SrcAsset2') as unknown as ERC20Mock

  const sa2 = await Erc20.deploy('SrcAsset2', 'SrcAsset2') as unknown as ERC20Mock
  const da1 = await Erc20.deploy('DestAsset1', 'DestAsset1') as unknown as ERC20Mock

  return {
    otc,
    domainContract,
    srcAssets: [sa1, sa2],
    destAssets: [da1],
    owner,
    domainOwner,
    accounts
  }
}

export default deployFixture

import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Otc, Offer } from './types'
import { deployFixture, addAssetFixture } from './fixtures'

describe('OTC', () => {
  describe('constructor', () => {
    it('fail: domain contract is zero', async () => {
      const OTC = await ethers.getContractFactory('TestOTC')
      const OfferFactory = await ethers.getContractFactory('OfferFactory')

      const offerFactory = await OfferFactory.deploy()
      await expect(
        OTC.deploy(ethers.ZeroAddress, offerFactory.address)
      )
        .to.be.revertedWithCustomError(OTC, 'OTCError')
        .withArgs(Otc.ErrorType.ZeroAddress)
    })

    it('fail: offer factory is zero', async () => {
      const OTC = await ethers.getContractFactory('TestOTC')
      const DomainContract = await ethers.getContractFactory('DomainContract')

      const domainContract = await DomainContract.deploy()
      await expect(
        OTC.deploy(domainContract.address, ethers.ZeroAddress)
      )
        .to.be.revertedWithCustomError(OTC, 'OTCError')
        .withArgs(Otc.ErrorType.ZeroAddress)
    })
  })

  describe('OTC.addAsset', () => {
    it('success', async () => {
      const {
        owner,
        otc,
        srcAssets: [sa1]
      } = await loadFixture(deployFixture)

      expect(await otc.assets(await sa1.getAddress())).to.eq(false)

      await expect(otc.connect(owner).addAsset(await sa1.getAddress()))
        .to.emit(otc, 'AssetAdded')
        .withArgs(await sa1.getAddress())

      expect(await otc.assets(await sa1.getAddress())).to.eq(true)
    })

    it('fail: not owner', async () => {
      const {
        accounts: [alice],
        otc,
        srcAssets: [, sa2]
      } = await loadFixture(deployFixture)

      expect(await otc.assets(await sa2.getAddress())).to.eq(false)

      await expect(otc.connect(alice).addAsset(await sa2.getAddress())).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )

      expect(await otc.assets(await sa2.getAddress())).to.eq(false)
    })

    it('fail: asset already added', async () => {
      const {
        owner,
        otc,
        srcAssets: [sa1]
      } = await loadFixture(deployFixture)

      await otc.connect(owner).addAsset(await sa1.getAddress())

      expect(await otc.assets(await sa1.getAddress())).to.eq(true)

      await expect(otc.connect(owner).addAsset(await sa1.getAddress()))
        .to.be.revertedWithCustomError(otc, 'OTCError')
        .withArgs(Otc.ErrorType.AssetAlreadyAdded)

      expect(await otc.assets(await sa1.getAddress())).to.eq(true)
    })
  })

  describe('OTC.removeAsset', () => {
    it('success', async () => {
      const {
        owner,
        otc,
        srcAssets: [, sa2]
      } = await loadFixture(deployFixture)

      await otc.connect(owner).addAsset(await sa2.getAddress())

      expect(await otc.assets(await sa2.getAddress())).to.eq(true)

      await expect(otc.connect(owner).removeAsset(await sa2.getAddress()))
        .to.emit(otc, 'AssetRemoved')
        .withArgs(await sa2.getAddress())

      expect(await otc.assets(await sa2.getAddress())).to.eq(false)
    })

    it('fail: not owner', async () => {
      const {
        accounts: [alice],
        otc,
        srcAssets: [, sa2]
      } = await loadFixture(deployFixture)

      expect(await otc.assets(await sa2.getAddress())).to.eq(false)

      await expect(
        otc.connect(alice).removeAsset(await sa2.getAddress())
      ).to.be.revertedWith('Ownable: caller is not the owner')

      expect(await otc.assets(await sa2.getAddress())).to.eq(false)
    })

    it('fail: asset already removed', async () => {
      const {
        owner,
        otc,
        srcAssets: [, sa2]
      } = await loadFixture(deployFixture)

      expect(await otc.assets(await sa2.getAddress())).to.eq(false)

      await expect(otc.connect(owner).removeAsset(await sa2.getAddress()))
        .to.be.revertedWithCustomError(otc, 'OTCError')
        .withArgs(Otc.ErrorType.AssetAlreadyRemoved)

      expect(await otc.assets(await sa2.getAddress())).to.eq(false)
    })
  })

  describe('OTC.commissionRateScale', () => {
    it('success', async () => {
      const { otc } = await loadFixture(deployFixture)

      expect(await otc.commissionRateScale()).to.eq(Math.pow(10, 5))
    })
  })

  describe('OTC.createOffer', () => {
    it('fail: source asset unregistered', async () => {
      const {
        accounts: [domainOwner],
        otc,
        srcAssets: [, sa2],
        destAssets: [da1]
      } = await loadFixture(addAssetFixture)

      await expect(
        otc.createOffer(
          'sample',
          ethers.encodeBytes32String('some bytes32 string'),
          domainOwner.address,
          await sa2.getAddress(),
          await da1.getAddress(),
          0,
          0,
          0,
          0
        )
      )
        .to.be.revertedWithCustomError(otc, 'OTCError')
        .withArgs(Otc.ErrorType.SourceAssetUnregistered)
    })

    it('fail: dest asset unregistered', async () => {
      const {
        accounts: [domainOwner],
        otc,
        srcAssets: [sa1, da2]
      } = await loadFixture(addAssetFixture)

      await expect(
        otc.createOffer(
          'sample',
          ethers.encodeBytes32String('some bytes32 string'),
          domainOwner.address,
          await sa1.getAddress(),
          await da2.getAddress(),
          0,
          0,
          0,
          0
        )
      )
        .to.be.revertedWithCustomError(otc, 'OTCError')
        .withArgs(Otc.ErrorType.DestAssetUnregistered)
    })

    it('fail: commission rate beyond limit', async () => {
      const {
        accounts: [domainOwner],
        otc,
        srcAssets: [sa1],
        destAssets: [sd1]
      } = await loadFixture(addAssetFixture)

      const commissionRateScale = await otc.commissionRateScale()

      await expect(
        otc.createOffer(
          'sample',
          ethers.encodeBytes32String('some bytes32 string'),
          domainOwner.address,
          await sa1.getAddress(),
          await sd1.getAddress(),
          0,
          0,
          commissionRateScale + 1n,
          0
        )
      )
        .to.be.revertedWithCustomError(otc, 'OTCError')
        .withArgs(Otc.ErrorType.CommissionRateBeyondLimit)
    })

    it('fail: not enough ethers sent', async () => {
      const {
        domainOwner,
        domainContract,
        otc,
        srcAssets: [sa1],
        destAssets: [da1]
      } = await loadFixture(addAssetFixture)

      const price = await domainContract.getPrice('sample')

      await expect(
        otc.createOffer(
          'sample',
          ethers.encodeBytes32String('some bytes32 string'),
          domainOwner.address,
          await sa1.getAddress(),
          await da1.getAddress(),
          0,
          0,
          0,
          0,
          {
            value: price - 1n
          }
        )
      ).to.be.revertedWithoutReason()
    })

    it('success', async () => {
      const {
        domainOwner,
        domainContract,
        otc,
        accounts: [creator],
        srcAssets: [sa1],
        destAssets: [da1]
      } = await loadFixture(addAssetFixture)

      const depositAmount = 100

      const domain = 'sample'

      const price = await domainContract.getPrice(domain)

      const offerAddress = await otc.testOfferAddress(domain)

      await sa1.connect(creator).approve(offerAddress, depositAmount)

      await expect(
        otc
          .connect(creator)
          .createOffer(
            domain,
            ethers.encodeBytes32String('some bytes32 string'),
            domainOwner.address,
            await sa1.getAddress(),
            await da1.getAddress(),
            depositAmount,
            0,
            0,
            0,
            {
              value: price
            }
          )
      )
        .to.emit(otc, 'OfferCreated')
        .withArgs(
          domain,
          await sa1.getAddress(),
          await da1.getAddress(),
          offerAddress,
          domainOwner.address,
          depositAmount,
          0,
          0,
          0
        )

      expect(await otc.offerAddress(domain)).to.eq(offerAddress)

      const offerContract = await ethers.getContractAt('Offer', offerAddress)

      expect(await offerContract.status()).to.eq(Offer.Status.Open)

      expect(await offerContract.deposits(creator.address)).to.eq(
        depositAmount
      )

      expect(await offerContract.totalDeposits()).to.eq(depositAmount)
    })
  })

  describe('offerAddress', () => {
    it('success: zero address for non-created offer', async () => {
      const { otc } = await loadFixture(addAssetFixture)

      expect(await otc.offerAddress('domain-no-offer')).to.eq(
        ethers.ZeroAddress
      )
    })
  })
})

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Otc, Offer } from "./types";

describe("Offer", () => {
  const deployFixture = async () => {
    const [owner, domainOwner, ...accounts] = await ethers.getSigners();

    const OfferFactory = await ethers.getContractFactory("OfferFactory");
    const DomainContract = await ethers.getContractFactory("DomainContract");
    const Otc = await ethers.getContractFactory("TestOTC");
    const Erc20 = await ethers.getContractFactory("ERC20Mock");

    const offerFactory = await OfferFactory.deploy();
    const domainContract = await DomainContract.deploy();
    const otc = await Otc.deploy(domainContract.address, offerFactory.address);

    const sa1 = await Erc20.deploy("SrcAsset1", "SrcAsset2");
    const sa2 = await Erc20.deploy("SrcAsset2", "SrcAsset2");
    const da1 = await Erc20.deploy("DestAsset1", "DestAsset1");

    return {
      otc,
      domainContract,
      srcAssets: [sa1, sa2],
      destAssets: [da1],
      owner,
      domainOwner,
      accounts,
    };
  };

  const createOfferFixture = async () => {
    const data = await deployFixture();
    const {
      otc,
      accounts: [depositor],
      srcAssets: [sa1],
      destAssets: [da1],
      owner,
    } = data;

    await otc.connect(owner).addAsset(sa1.address);
    await otc.connect(owner).addAsset(da1.address);

    await sa1.mint(depositor.address, 10000000000);

    return data;
  };

  describe("constructor", () => {
    it("fail: domain contract is zero", async () => {
      const OTC = await ethers.getContractFactory("TestOTC");
      const OfferFactory = await ethers.getContractFactory("OfferFactory");

      const offerFactory = await OfferFactory.deploy();
      await expect(
        OTC.deploy(ethers.constants.AddressZero, offerFactory.address)
      )
        .to.be.revertedWithCustomError(OTC, "OTCError")
        .withArgs(Otc.ErrorType.ZeroAddress);
    });

    it("fail: offer factory is zero", async () => {
      const OTC = await ethers.getContractFactory("TestOTC");
      const DomainContract = await ethers.getContractFactory("DomainContract");

      const domainContract = await DomainContract.deploy();
      await expect(
        OTC.deploy(domainContract.address, ethers.constants.AddressZero)
      )
        .to.be.revertedWithCustomError(OTC, "OTCError")
        .withArgs(Otc.ErrorType.ZeroAddress);
    });
  });

  describe("OTC.addAsset", () => {
    it("success", async () => {
      const {
        owner,
        otc,
        srcAssets: [sa1],
      } = await loadFixture(deployFixture);

      expect(await otc.assets(sa1.address)).to.eq(false);

      await expect(otc.connect(owner).addAsset(sa1.address))
        .to.emit(otc, "AssetAdded")
        .withArgs(sa1.address);

      expect(await otc.assets(sa1.address)).to.eq(true);
    });

    it("fail: not owner", async () => {
      const {
        accounts: [alice],
        otc,
        srcAssets: [, sa2],
      } = await loadFixture(deployFixture);

      expect(await otc.assets(sa2.address)).to.eq(false);

      await expect(otc.connect(alice).addAsset(sa2.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );

      expect(await otc.assets(sa2.address)).to.eq(false);
    });

    it("fail: asset already added", async () => {
      const {
        owner,
        otc,
        srcAssets: [sa1],
      } = await loadFixture(deployFixture);

      await otc.connect(owner).addAsset(sa1.address);

      expect(await otc.assets(sa1.address)).to.eq(true);

      await expect(otc.connect(owner).addAsset(sa1.address))
        .to.be.revertedWithCustomError(otc, "OTCError")
        .withArgs(Otc.ErrorType.AssetAlreadyAdded);

      expect(await otc.assets(sa1.address)).to.eq(true);
    });
  });

  describe("OTC.removeAsset", () => {
    it("success", async () => {
      const {
        owner,
        otc,
        srcAssets: [, sa2],
      } = await loadFixture(deployFixture);

      await otc.connect(owner).addAsset(sa2.address);

      expect(await otc.assets(sa2.address)).to.eq(true);

      await expect(otc.connect(owner).removeAsset(sa2.address))
        .to.emit(otc, "AssetRemoved")
        .withArgs(sa2.address);

      expect(await otc.assets(sa2.address)).to.eq(false);
    });

    it("fail: not owner", async () => {
      const {
        accounts: [alice],
        otc,
        srcAssets: [, sa2],
      } = await loadFixture(deployFixture);

      expect(await otc.assets(sa2.address)).to.eq(false);

      await expect(
        otc.connect(alice).removeAsset(sa2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await otc.assets(sa2.address)).to.eq(false);
    });

    it("fail: asset already removed", async () => {
      const {
        owner,
        otc,
        srcAssets: [, sa2],
      } = await loadFixture(deployFixture);

      expect(await otc.assets(sa2.address)).to.eq(false);

      await expect(otc.connect(owner).removeAsset(sa2.address))
        .to.be.revertedWithCustomError(otc, "OTCError")
        .withArgs(Otc.ErrorType.AssetAlreadyRemoved);

      expect(await otc.assets(sa2.address)).to.eq(false);
    });
  });

  describe("OTC.commissionRateScale", () => {
    it("success", async () => {
      const { otc } = await loadFixture(deployFixture);

      expect(await otc.commissionRateScale()).to.eq(Math.pow(10, 5));
    });
  });

  describe("OTC.createOffer", () => {
    it("fail: source asset unregistered", async () => {
      const {
        accounts: [domainOwner],
        otc,
        srcAssets: [sa1, sa2],
        destAssets: [da1],
      } = await loadFixture(createOfferFixture);

      await expect(
        otc.createOffer(
          "sample",
          ethers.utils.formatBytes32String("some bytes32 string"),
          domainOwner.address,
          sa2.address,
          da1.address,
          0,
          0,
          0,
          0
        )
      )
        .to.be.revertedWithCustomError(otc, "OTCError")
        .withArgs(Otc.ErrorType.SourceAssetUnregistered);
    });

    it("fail: dest asset unregistered", async () => {
      const {
        accounts: [domainOwner],
        otc,
        srcAssets: [sa1, da2],
      } = await loadFixture(createOfferFixture);

      await expect(
        otc.createOffer(
          "sample",
          ethers.utils.formatBytes32String("some bytes32 string"),
          domainOwner.address,
          sa1.address,
          da2.address,
          0,
          0,
          0,
          0
        )
      )
        .to.be.revertedWithCustomError(otc, "OTCError")
        .withArgs(Otc.ErrorType.DestAssetUnregistered);
    });

    it("fail: commission rate beyond limit", async () => {
      const {
        accounts: [domainOwner],
        otc,
        srcAssets: [sa1],
        destAssets: [sd1],
      } = await loadFixture(createOfferFixture);

      const commissionRateScale = await otc.commissionRateScale();

      await expect(
        otc.createOffer(
          "sample",
          ethers.utils.formatBytes32String("some bytes32 string"),
          domainOwner.address,
          sa1.address,
          sd1.address,
          0,
          0,
          commissionRateScale.add(1),
          0
        )
      )
        .to.be.revertedWithCustomError(otc, "OTCError")
        .withArgs(Otc.ErrorType.CommissionRateBeyondLimit);
    });

    it("fail: not enough ethers sent", async () => {
      const {
        domainOwner,
        domainContract,
        otc,
        srcAssets: [sa1],
        destAssets: [da1],
      } = await loadFixture(createOfferFixture);

      const price = await domainContract.getPrice("sample");

      await expect(
        otc.createOffer(
          "sample",
          ethers.utils.formatBytes32String("some bytes32 string"),
          domainOwner.address,
          sa1.address,
          da1.address,
          0,
          0,
          0,
          0,
          {
            value: price.sub(1),
          }
        )
      ).to.be.revertedWithoutReason();
    });

    it("success", async () => {
      const {
        domainOwner,
        domainContract,
        otc,
        accounts: [depositor],
        srcAssets: [sa1],
        destAssets: [da1],
      } = await loadFixture(createOfferFixture);

      const depositAmount = 100;

      const domain = "sample";

      const price = await domainContract.getPrice(domain);

      const offerAddress = await otc.testOfferAddress(domain);

      await sa1.connect(depositor).approve(offerAddress, depositAmount);

      await expect(
        otc
          .connect(depositor)
          .createOffer(
            domain,
            ethers.utils.formatBytes32String("some bytes32 string"),
            domainOwner.address,
            sa1.address,
            da1.address,
            depositAmount,
            0,
            0,
            0,
            {
              value: price,
            }
          )
      )
        .to.emit(otc, "OfferCreated")
        .withArgs(
          domain,
          sa1.address,
          da1.address,
          offerAddress,
          domainOwner.address,
          depositAmount,
          0,
          0,
          0
        );

      expect(await otc.offerAddress(domain)).to.eq(offerAddress);

      const offerContract = await ethers.getContractAt("Offer", offerAddress);

      expect(await offerContract.status()).to.eq(Offer.Status.Open);

      expect(await offerContract.deposits(depositor.address)).to.eq(
        depositAmount
      );

      expect(await offerContract.totalDeposits()).to.eq(depositAmount);
    });
  });

  describe("offerAddress", () => {
    it("success: zero address for non-created offer", async () => {
      const { otc } = await loadFixture(createOfferFixture);

      expect(await otc.offerAddress("domain-no-offer")).to.eq(
        ethers.constants.AddressZero
      );
    });
  });
});

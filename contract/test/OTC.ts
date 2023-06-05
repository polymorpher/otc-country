import { time } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { TestEnv, Otc } from "./types";

describe("Offer", function () {
  const env: TestEnv = {} as TestEnv;

  before(async () => {
    const [owner, ...accounts] = await ethers.getSigners();

    const OfferFactory = await ethers.getContractFactory("OfferFactory");
    const DomainContract = await ethers.getContractFactory("DomainContract");
    const Otc = await ethers.getContractFactory("OTC");
    const Erc20 = await ethers.getContractFactory("ERC20Mock");

    const offerFactory = await OfferFactory.deploy();
    const domainContract = await DomainContract.deploy();
    const otc = await Otc.deploy(domainContract.address, offerFactory.address);

    const sa1 = await Erc20.deploy("SrcAsset1", "SrcAsset2");
    const sa2 = await Erc20.deploy("SrcAsset2", "SrcAsset2");
    const da1 = await Erc20.deploy("DestAsset1", "DestAsset1");

    env.otc = otc;
    env.srcAssets = [sa1, sa2];
    env.destAssets = [da1];
    env.owner = owner;
    env.accounts = accounts;
  });

  describe("OTC.addAsset", () => {
    it("success", async () => {
      const {
        owner,
        otc,
        srcAssets: [sa1],
      } = env;

      expect(await otc.assets(sa1.address)).to.equal(false);

      await expect(otc.connect(owner).addAsset(sa1.address))
        .to.emit(otc, "AssetAdded")
        .withArgs(sa1.address);

      expect(await otc.assets(sa1.address)).to.equal(true);
    });

    it("fail: not owner", async () => {
      const {
        accounts: [alice],
        otc,
        srcAssets: [, sa2],
      } = env;

      expect(await otc.assets(sa2.address)).to.equal(false);

      await expect(otc.connect(alice).addAsset(sa2.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );

      expect(await otc.assets(sa2.address)).to.equal(false);
    });

    it("fail: asset already added", async () => {
      const {
        owner,
        otc,
        srcAssets: [sa1],
      } = env;

      expect(await otc.assets(sa1.address)).to.equal(true);

      await expect(otc.connect(owner).addAsset(sa1.address))
        .to.be.revertedWithCustomError(otc, "OTCError")
        .withArgs(Otc.ErrorType.AssetAlreadyAdded);

      expect(await otc.assets(sa1.address)).to.equal(true);
    });
  });
});

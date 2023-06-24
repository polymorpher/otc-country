import { ethers } from "hardhat";

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

export default deployFixture;

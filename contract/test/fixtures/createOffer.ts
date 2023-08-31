import { ethers } from "hardhat";
import addAsset from "./addAsset";

const createOfferFixture = async () => {
  const data = await addAsset();
  const {
    otc,
    domainContract,
    domainOwner,
    accounts: [creator, ...accounts],
    srcAssets: [sa1],
    destAssets: [da1],
  } = data;

  const creatorDepositAmount = 100;

  const acceptAmount = 50;

  const commissionRate = 0.1 * 100000;

  const lockWithdrawAfter = 3600;

  const domain = "sample";

  const price = await domainContract.getPrice(domain);

  const offerAddress = await otc.testOfferAddress(domain);

  const offer = await ethers.getContractAt("Offer", offerAddress);

  const [depositor, acceptor] = accounts;

  await sa1.connect(creator).approve(offerAddress, creatorDepositAmount);

  await sa1.mint(depositor.address, 10000000000);
  await da1.mint(acceptor.address, 10000000000);

  await sa1.connect(depositor).approve(offerAddress, 10000000000);
  await da1.connect(acceptor).approve(offerAddress, 10000000000);

  await otc
    .connect(creator)
    .createOffer(
      domain,
      ethers.utils.formatBytes32String("some bytes32 string"),
      domainOwner.address,
      sa1.address,
      da1.address,
      creatorDepositAmount,
      acceptAmount,
      commissionRate,
      lockWithdrawAfter,
      {
        value: price,
      }
    );

  return {
    ...data,
    acceptAmount,
    creatorDepositAmount,
    commissionRate,
    accounts,
    offer,
    creator,
  };
};

export default createOfferFixture;

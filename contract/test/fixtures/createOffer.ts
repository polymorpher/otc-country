import { ethers } from "hardhat";
import addAsset from "./addAsset";

const createOfferFixture = async () => {
  const data = await addAsset();
  const {
    otc,
    domainContract,
    domainOwner,
    accounts: [depositor],
    srcAssets: [sa1],
    destAssets: [da1],
    owner,
  } = data;

  const creatorDepositAmount = 100;

  const closeAmount = 50;

  const commissionRate = 0.1 * 100000;

  const lockWithdrawAfter = 3600;

  const domain = "sample";

  const price = await domainContract.getPrice(domain);

  const offerAddress = await otc.testOfferAddress(domain);

  await sa1.connect(depositor).approve(offerAddress, creatorDepositAmount);

  await otc
    .connect(depositor)
    .createOffer(
      domain,
      ethers.utils.formatBytes32String("some bytes32 string"),
      domainOwner.address,
      sa1.address,
      da1.address,
      creatorDepositAmount,
      closeAmount,
      commissionRate,
      lockWithdrawAfter,
      {
        value: price,
      }
    );

  return {
    ...data,
    creatorDepositAmount,
    closeAmount,
    commissionRate,
    lockWithdrawAfter,
  };
};

export default createOfferFixture;

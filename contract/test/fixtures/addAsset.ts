import deployFixture from "./deploy";

const addAssetFixture = async () => {
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

export default addAssetFixture;

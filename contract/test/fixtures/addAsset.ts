import deployFixture from './deploy'

const addAssetFixture = async () => {
  const data = await deployFixture()
  const {
    otc,
    accounts: [creator],
    srcAssets: [sa1],
    destAssets: [da1],
    owner
  } = data

  await otc.connect(owner).addAsset(sa1)
  await otc.connect(owner).addAsset(da1)

  await sa1.mint(creator.address, 10000000000)

  return data
}

export default addAssetFixture

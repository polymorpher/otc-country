import deployFixture from './deploy'

const addAssetFixture = async () => {
  const data = await deployFixture()
  const {
    otc,
    accounts: [creator],
    srcAssets: [sa1],
    destAssets: [da1],
    admin
  } = data

  await otc.connect(admin).addAsset(sa1)
  await otc.connect(admin).addAsset(da1)

  await sa1.mint(creator.address, 10000000000)

  return data
}

export default addAssetFixture

import { getAssetByAddress } from './assets'

const getPrice = async (tokenAddress: string) => {
  const asset = getAssetByAddress(tokenAddress)
  const rate = asset?.rate

  if (rate === undefined) {
    return 0
  }

  if (typeof (rate) === 'number') {
    return rate
  }

  const price = await fetch(`https://hermes.pyth.network/api/latest_price_feeds?ids[]=${rate}`)
    .then(res => res.json())
    .then(res => Number(res[0].price.price) * 10 ** res[0].price.expo)

  return price
}

export default getPrice

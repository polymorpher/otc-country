import { DEPEGGED, ASSETS } from './assets.js'

const getPrice = async (address: string) => {
  const asset = DEPEGGED.concat(ASSETS).find(
    (item) => item.value.toLowerCase() === address.toLowerCase()
  )
  const rate = asset?.rate

  if (rate === undefined) {
    return 0
  }

  if (!rate.startsWith('0x')) {
    return Number(rate)
  }

  const price = await fetch(
    `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${rate}`
  )
    .then((res) => res.json())
    .then((res) => Number(res[0].price.price) * 10 ** res[0].price.expo)

  return price
}

export default getPrice

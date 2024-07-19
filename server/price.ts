import { ASSETS, DEPEGGED } from '../app/src/helpers/assets'

const getPrice = async (tokenAddress: string) => {
  const rate = DEPEGGED.concat(ASSETS).find(item => item.value.toLowerCase() === tokenAddress.toLowerCase())?.rate

  if (rate === undefined) {
    return 0
  }

  if (typeof(rate) === 'number') {
    return rate
  }

  const price = await fetch(`https://hermes.pyth.network/api/latest_price_feeds?ids[]=${rate}`)
    .then(res => res.json())
    .then(res => Number(res[0].price.price))

  return price
}

export default getPrice

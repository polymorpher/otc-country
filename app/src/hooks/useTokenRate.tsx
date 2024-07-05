import { useEffect, useState } from 'react'
import { PriceServiceConnection } from '@pythnetwork/price-service-client'
import { ASSETS, DEPEGGED } from '~/helpers/assets'

const useTokenRate = (address: string): number => {
  const [rate, setRate] = useState(0)

  const value = DEPEGGED.concat(ASSETS).find(item => item.value === address)?.rate

  const fixedRate = typeof value === 'number'

  useEffect(() => {
    const connection = new PriceServiceConnection('https://hermes.pyth.network', {})

    if (!fixedRate && value) {
      connection.subscribePriceFeedUpdates([value], (priceFeed) => {
        const price = priceFeed.getPriceNoOlderThan(60)
        setRate(Number(price?.price) / 1e8)
      }).catch(() => {
        console.log('subscribe error')
      })
    }

    return () => {
      connection.closeWebSocket()
    }
  }, [fixedRate, value])

  if (fixedRate) {
    return value
  }

  return rate
}

export default useTokenRate

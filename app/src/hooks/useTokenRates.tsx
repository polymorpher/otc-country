import { useEffect, useRef, useState } from 'react'
import { ASSETS, DEPEGGED } from '~/helpers/assets.js'
import type { Asset } from '~/helpers/assets.js'

interface PriceData {
  parsed: Array<{
    id: string
    price: {
      price: string
      expo: number
    }
  }>
}

const useTokenRates = (...addresses: string[]): number[] => {
  const [rates, setRates] = useState(Array(addresses.length).fill(0))
  const es = useRef<EventSource>()

  const addr = JSON.stringify(addresses)

  useEffect(() => {
    /**
     * attach sequential number
     * split into fixed rates and dynamic rates
     * get values each
     * merge and sort by the number previously
     */
    const addresses = JSON.parse(addr)

    const assets: Array<[number, Asset]> = DEPEGGED.concat(ASSETS)
      .filter((item) => addresses.includes(item.value))
      .map((x, key) => [key, x])

    const dynamicRates = assets
      .filter((item) => item[1].rate.startsWith('0x'))
      .map((item) => [item[1].rate, [item[1].value, item[0]]])

    const fixedRates = assets
      .filter((item) => !item[1].rate.startsWith('0x'))
      .map((item) => [Number(item[1].rate), item[0]])

    if (dynamicRates.length) {
      const dynamicRateMap = Object.fromEntries(dynamicRates)

      const query = Object.keys(dynamicRateMap)
        .map((id) => `ids[]=${id}`)
        .join('&')
      const eventSource = new EventSource(
        `https://hermes.pyth.network/v2/updates/price/stream?${query}`
      )

      es.current = eventSource

      eventSource.onmessage = (e) => {
        const { parsed } = JSON.parse(e.data) as PriceData
        const data = parsed.map((x) => [
          Number(x.price.price) * 10 ** x.price.expo,
          dynamicRateMap[`0x${x.id}`][1]
        ])

        setRates(
          data
            .concat(fixedRates)
            .sort((a, b) => a[1] - b[1])
            .map((x) => x[0])
        )
      }
    } else {
      setRates(fixedRates.map((x) => x[0]))
    }

    return () => es.current?.close()
  }, [addr])

  return rates
}

export default useTokenRates

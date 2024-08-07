import React, { useCallback, useEffect, useState, useRef } from 'react'
import { FormControl, Text, VStack } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import AssetSelect from '~/components/AssetSelect'
import { type Asset, ASSETS, DEPEGGED } from '~/helpers/assets'
import * as CONFIG from '~/helpers/config'
import Event from '~/components/Event'
import type { EventType } from '~/components/Event'

const PAGE_SIZE = 10

const ALL_ASSETS = '0x0'

const ALL_ASSET_OPTION = { value: ALL_ASSETS, label: 'All', rate: 0, icon: '' }

const EventHistory: React.FC<BoxProps> = (props) => {
  const [assetAddress, setAssetAddress] = useState(ALL_ASSETS)
  const page = useRef(0)
  const morePage = useRef(true)
  const [events, setEvents] = useState<EventType[]>([])

  useEffect(() => {
    setEvents([])
  }, [assetAddress])

  const fetchData = useCallback(() => {
    const query = [`age=${24 * 31}`, `page=${page.current}`]

    if (assetAddress !== ALL_ASSETS) {
      query.push(`asset=${assetAddress}`)
    }

    fetch(CONFIG.SERVER + '?' + query.join('&'))
      .then((res) => res.json())
      .then(res => {
        setEvents(prev => prev.concat(res))
        morePage.current = res.length <= PAGE_SIZE
      })
  }, [assetAddress])

  useEffect(() => {
    setEvents([])
    page.current = 0
    fetchData()
  }, [fetchData])

  return (
    <VStack w="100%" {...props}>
      <Text fontSize={20}>Offer History</Text>
      <FormControl>
        <AssetSelect
          value={assetAddress}
          onChange={setAssetAddress}
          list={([ALL_ASSET_OPTION] as Asset[]).concat(DEPEGGED).concat(ASSETS)}
        />
      </FormControl>
      {events.map((event, key) => (
        <Event event={event} key={key} />
      ))}
    </VStack>
  )
}

export default EventHistory

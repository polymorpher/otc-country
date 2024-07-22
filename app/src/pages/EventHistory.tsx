import React, { useCallback, useEffect, useState, useRef } from 'react'
import { FormControl, Text, VStack } from '@chakra-ui/react'
import AssetSelect from '~/components/AssetSelect'
import { ASSETS, DEPEGGED } from '~/helpers/assets'
import * as CONFIG from '~/helpers/config'

const PAGE_SIZE = 10

const EventHistory: React.FC = () => {
  const [asset, setAsset] = useState('all')
  const page = useRef(0)
  const morePage = useRef(true)
  const [events, setEvents] = useState([])

  useEffect(() => {
    setEvents([])
  }, [asset])

  const fetchData = useCallback(() => {
    const query = [`age=${24 * 31}`, `page=${page.current}`]

    if (asset !== 'all') {
      query.push(`asset=${asset}`)
    }

    fetch(CONFIG.SERVER + '?' + query.join('&'))
      .then((res) => res.json())
      .then(res => {
        setEvents(prev => prev.concat(res))
        morePage.current = res.length <= PAGE_SIZE
      })
  }, [asset])

  useEffect(() => {
    setEvents([])
    page.current = 0
    fetchData()
  }, [fetchData])

  return (
    <VStack w="3xl">
      <Text fontSize={20}>Offer History</Text>
      <FormControl>
        <AssetSelect
          value={asset}
          onChange={setAsset}
          list={[{ value: 'all', label: 'All' }].concat(DEPEGGED).concat(ASSETS)}
        />
      </FormControl>
      {events.map((event, key) => (
        <div key={key}>
          ss
        </div>
      ))}
    </VStack>
  )
}

export default EventHistory

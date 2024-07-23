import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Box, FormControl, Link, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import AssetSelect from '~/components/AssetSelect'
import { ASSETS, DEPEGGED } from '~/helpers/assets'
import * as CONFIG from '~/helpers/config'
import AddressField from '~/components/AddressField'
import { fmtTime } from '~/helpers/format'

const PAGE_SIZE = 10

interface Event {
  event_name: string
  domain_name: string
  src_asset: string
  dest_asset: string
  offer_address: string
  domain_owner: string
  close_amount: string
  src_price: string
  dest_price: string
  time: string
}

const EventHistory: React.FC<BoxProps> = (props) => {
  const [asset, setAsset] = useState('all')
  const page = useRef(0)
  const morePage = useRef(true)
  const [events, setEvents] = useState<Event[]>([])

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
    <VStack w="3xl" {...props}>
      <Text fontSize={20}>Offer History</Text>
      <FormControl>
        <AssetSelect
          value={asset}
          onChange={setAsset}
          list={[{ value: 'all', label: 'All' }].concat(DEPEGGED).concat(ASSETS)}
        />
      </FormControl>
      {events.map((event, key) => (
        <SimpleGrid
          columns={2}
          rowGap={0}
          columnGap={4}
          width="full"
          rounded="md"
          boxShadow="base"
          border="1px"
          borderColor="gray.200"
          p="2"
          as={Link}
          href={`/offer/${event.offer_address}`}
          target="_blank"
          _hover={{ textDecor: 'none', bgColor: 'gray.100' }}
          key={key}
        >
          <Box textAlign="right">
            {event.event_name}
          </Box>
          <Box />
          <Box textAlign="right">
            Source Asset
          </Box>
          <AddressField shorten>
            {event.src_asset}
          </AddressField>
          <Box textAlign="right">
            Source Amount
          </Box>
          <Box textAlign="right">
          </Box>
          <Box textAlign="right">
            Destination Asset
          </Box>
          <AddressField shorten>
            {event.dest_asset}
          </AddressField>
          <Box textAlign="right">
            Accept Amount
          </Box>
          <Box>

          </Box>
          <Box textAlign="right">
            Exchange Rate
          </Box>
          <Box>
          </Box>
          <Box textAlign="right">
            Domain Name
          </Box>
          <Box>
            {event.domain_name}
          </Box>
          <Box textAlign="right">
            Created At
          </Box>
          <Box>
            {fmtTime(event.time)}
          </Box>
        </SimpleGrid>
      ))}
    </VStack>
  )
}

export default EventHistory

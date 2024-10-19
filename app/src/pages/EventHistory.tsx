import React, { useEffect, useState } from 'react'
import { FormControl, Spinner, Text, VStack } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import gql from '~/graphql/client'
import { GET_ALL_EVENTS } from '~/graphql/queries'
import AssetSelect from '~/components/AssetSelect'
import Event from '~/components/Event'
import type { EventType } from '~/components/Event'
import { type Asset, ASSETS, DEPEGGED } from '~/helpers/assets'
import useShowError from '~/hooks/useShowError'

const ALL_ASSETS = '0x0'

const ALL_ASSET_OPTION = { value: ALL_ASSETS, label: 'All', rate: 0, icon: '' }

const EventHistory: React.FC<BoxProps> = (props) => {
  const [assetAddress, setAssetAddress] = useState(ALL_ASSETS)
  const showError = useShowError()

  const { data, isLoading, error } = useQuery<EventType[]>({
    queryKey: ['events', 'all'],
    queryFn: gql.request(GET_ALL_EVENTS),
  })

  useEffect(() => {
    if (error) {
      showError({ title: 'Failed to show offer history', message: JSON.stringify(error) }) 
    }
  }, [error])

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
      {isLoading && <Spinner />}
      {data && data.map((event, key) => (
        <Event event={event} key={key} />
      ))}
    </VStack>
  )
}

export default EventHistory

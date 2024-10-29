import React, { useEffect, useState } from 'react'
import { FormControl, Spinner, Text, VStack } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import client from '~/graphql/client'
import { GET_ALL_EVENTS, GET_EVENTS_FOR_ASSET } from '~/graphql/queries'
import AssetSelect from '~/components/AssetSelect'
import Event from '~/components/Event'
import type { EventType } from '~/components/Event'
import { Asset, ASSETS, DEPEGGED } from '~/helpers/assets'
import useShowError from '~/hooks/useShowError'
import { ErrorType } from '~/helpers/error'

const ALL_ASSETS = ''

const ALL_ASSET_OPTION = new Asset(ALL_ASSETS, 'All', '', '0')

const EventHistory: React.FC<BoxProps> = (props) => {
  const [assetAddress, setAssetAddress] = useState(ALL_ASSETS)
  const showError = useShowError()

  const { data, isLoading, error } = useQuery<{ events: EventType[] }>({
    queryKey: ['events', assetAddress],
    queryFn: () =>
      client.request(
        assetAddress === ALL_ASSETS ? GET_ALL_EVENTS : GET_EVENTS_FOR_ASSET,
        { asset: assetAddress }
      )
  })

  useEffect(() => {
    if (error) {
      showError({
        title: 'Failed to show offer history',
        error,
        type: ErrorType.QUERY
      })
    }
  }, [error, showError])

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
      {data?.events.map((event, key) => <Event event={event} key={key} />)}
    </VStack>
  )
}

export default EventHistory

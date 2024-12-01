import React, { useEffect, useState } from 'react'
import {
  FormControl,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Th,
  Text,
  Thead,
  Tr,
  VStack
} from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import client from '~/graphql/client.js'
import { GET_ALL_EVENTS, GET_EVENTS_FOR_ASSET } from '~/graphql/queries.js'
import AssetSelect from '~/components/AssetSelect.js'
import Event from '~/components/Event.js'
import type { EventType } from '~/components/Event.js'
import { Asset, ASSETS, DEPEGGED } from '~/helpers/assets.js'
import useShowError from '~/hooks/useShowError.js'
import { ErrorType } from '~/helpers/error.js'

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
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Open?</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Rate</Th>
              <Th>Domain</Th>
              <Th>When</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data?.events.map((event, key) => (
              <Event event={event} key={key} asTableRow />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  )
}

export default EventHistory

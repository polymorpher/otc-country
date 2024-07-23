import React from 'react'
import { Box, Link, SimpleGrid } from '@chakra-ui/react'
import type { Address } from 'wagmi'
import { useContractRead } from 'wagmi'
import { getAssetByAddress } from '~/helpers/assets'
import AddressField from '~/components/AddressField'
import { fmtNum, fmtTime } from '~/helpers/format'
import { erc20Contract } from '~/helpers/contracts'
import { formatUnits } from 'viem'

export interface EventType {
  event_name: 'OfferCreated' | 'OfferAccepted'
  domain_name: string
  src_asset: string
  dest_asset: string
  offer_address: string
  domain_owner: string
  close_amount: string
  total_deposits: string
  src_price: string
  dest_price: string
  time: string
}

interface EventProps {
  event: EventType
}

const Event: React.FC<EventProps> = ({ event }) => {
  const { data: srcDecimals } = useContractRead({
    ...erc20Contract(event.src_asset as Address),
    functionName: 'decimals'
  })

  const { data: destDecimals } = useContractRead({
    ...erc20Contract(event.dest_asset as Address),
    functionName: 'decimals'
  })

  return (
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
    >
      <Box textAlign="right">
        {event.event_name === 'OfferAccepted' ? 'Offer Accepted' : 'Offer Created'}
      </Box>
      <Box />
      <Box textAlign="right">
        Source Asset
      </Box>
      <AddressField text={getAssetByAddress(event.src_asset)?.label}>
        {event.src_asset}
      </AddressField>
      <Box textAlign="right">
        Source Amount
      </Box>
      <Box>
        {fmtNum(formatUnits(BigInt(event.total_deposits), Number(srcDecimals)))}
      </Box>
      <Box textAlign="right">
        Destination Asset
      </Box>
      <AddressField text={getAssetByAddress(event.dest_asset)?.label}>
        {event.dest_asset}
      </AddressField>
      <Box textAlign="right">
        Accept Amount
      </Box>
      <Box>
        {fmtNum(formatUnits(BigInt(event.close_amount), Number(destDecimals)))}
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
  )
}

export default Event

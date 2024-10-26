import React from 'react'
import { Box, SimpleGrid } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import getPrice from '~/helpers/price'
import AddressField from '~/components/AddressField'
import { fmrHr, fmtNum, fmtTime } from '~/helpers/format'

interface Asset {
  address: string
  decimals: number
  label: string
}

interface Offer {
  domainName: string
  sourceAsset: Asset
  destAsset: Asset
  offerAddress: string
  domainOwner: string
  depositHistory: bigint[]
  totalDeposits: bigint
  closeAmount: bigint
  commissionRate: number
  lockWithdrawAfter: number
}

export interface EventType {
  type: 'ACCEPTED' | 'CREATED'
  offer: Offer
  sourceAssetPrice: number
  destAssetPrice: number
  blockNumber: number
  txHash: string
  timestamp: number
}

interface EventProps {
  event: EventType
}

const Event: React.FC<EventProps> = ({ event }) => {
  const { data: srcAssetRate } = useQuery<number>({
    queryKey: ['rate', event.offer.sourceAsset.address],
    queryFn: () => getPrice(event.offer.sourceAsset.address)
  })

  const { data: destAssetRate } = useQuery<number>({
    queryKey: ['rate', event.offer.destAsset.address],
    queryFn: () => getPrice(event.offer.destAsset.address)
  })

  const srcAmount = Number(formatUnits(
    event.type === 'ACCEPTED' ? event.offer.depositHistory[0] : event.offer.totalDeposits,
    event.offer.sourceAsset.decimals
  ))

  const destAmount = Number(formatUnits(event.offer.closeAmount, event.offer.destAsset.decimals))

  const elapsed = Math.ceil(Date.now() / 1000) - Number(event.timestamp)

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
      onClick={() => { window.open(`/offer/${event.offer.domainName}`) }}
      cursor="pointer"
      _hover={{ textDecor: 'none', bgColor: 'gray.100' }}
    >
      <Box textAlign="right">
        Status
      </Box>
      <Box>
        {event.type === 'ACCEPTED' ? 'Accepted' : 'Created'}
      </Box>
      <Box textAlign="right">
        Source Asset
      </Box>
      <AddressField text={event.offer.sourceAsset.label}>
        {event.offer.sourceAsset.address}
      </AddressField>
      <Box textAlign="right">
        Source Amount
      </Box>
      <Box>
        {fmtNum(srcAmount)}
      </Box>
      <Box textAlign="right">
        Destination Asset
      </Box>
      <AddressField text={event.offer.destAsset.label}>
        {event.offer.destAsset.address}
      </AddressField>
      <Box textAlign="right">
        Accept Amount
      </Box>
      <Box>
        {fmtNum(destAmount)}
      </Box>
      {event.type === 'CREATED'
        ? (
          <>
            <Box textAlign="right">
              Exchange Rate
            </Box>
            <Box>
              {destAssetRate && srcAssetRate && fmtNum(destAssetRate * destAmount / (srcAssetRate * srcAmount))}
            </Box>
          </>
          )
        : (
          <>
            <Box textAlign="right">
              Exchange Rate
            </Box>
            <Box />
            <Box textAlign="right">
              Current
            </Box>
            <Box>
              {destAssetRate && srcAssetRate && fmtNum(destAssetRate * destAmount / (srcAssetRate * srcAmount))}
            </Box>
            <Box textAlign="right">
              Accepted
            </Box>
            <Box>
              {fmtNum(event.destAssetPrice * destAmount / (event.sourceAssetPrice * srcAmount))}
            </Box>
          </>
          )}
      <Box textAlign="right">
        Domain Name
      </Box>
      <Box>
        {event.offer.domainName ?? 'N/A'}
      </Box>
      <Box textAlign="right">
        Time
      </Box>
      <Box>
        {fmtTime(new Date(event.timestamp * 1000).toUTCString())}
        <br/>
        {elapsed < 60 ? 'A few seconds' : elapsed < 3600 ? `${Math.round(elapsed / 60)} mins` : fmrHr(Math.round(elapsed / 3600))} ago
      </Box>
    </SimpleGrid>
  )
}

export default Event

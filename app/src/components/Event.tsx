import React from 'react'
import { Box, HStack, Link, Td, Tr, VStack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import getPrice from '~/helpers/price.js'
import AddressField from '~/components/AddressField.js'
import { fmrHr, fmtNum, fmtTime } from '~/helpers/format.js'
import { TLD, RESOLVE_UNKNOWN_ASSET, LOCAL_TARGET } from '~/helpers/config.js'
import cloneDeep from 'lodash/cloneDeep.js'
import { type Address } from 'abitype'
import CoinWithAmount from '~/components/CoinWithAmount.js'
import { ArrowDownIcon } from '@chakra-ui/icons'
import { buildTarget } from '~/helpers/link.js'

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
  asTableRow?: boolean
}

function resolveUnknownAsset(e0: EventType): EventType {
  const e = cloneDeep(e0)
  if (e0.offer.sourceAsset.label === 'Unknown') {
    const addr = e0.offer.sourceAsset.address.toLowerCase() as Address
    if (RESOLVE_UNKNOWN_ASSET[addr]) {
      e.offer.sourceAsset.label = RESOLVE_UNKNOWN_ASSET[addr].name
      e.offer.sourceAsset.decimals = RESOLVE_UNKNOWN_ASSET[addr].decimals
    }
  }
  if (e0.offer.destAsset.label === 'Unknown') {
    const addr = e0.offer.destAsset.address.toLowerCase() as Address
    if (RESOLVE_UNKNOWN_ASSET[addr]) {
      e.offer.destAsset.label = RESOLVE_UNKNOWN_ASSET[addr].name
      e.offer.destAsset.decimals = RESOLVE_UNKNOWN_ASSET[addr].decimals
    }
  }
  return e
}

const Event: React.FC<EventProps> = ({ event, asTableRow }) => {
  event = resolveUnknownAsset(event)
  const { data: srcAssetRate } = useQuery<number>({
    queryKey: ['rate', event.offer.sourceAsset.address],
    queryFn: () => getPrice(event.offer.sourceAsset.address)
  })

  const { data: destAssetRate } = useQuery<number>({
    queryKey: ['rate', event.offer.destAsset.address],
    queryFn: () => getPrice(event.offer.destAsset.address)
  })

  const srcAmount = Number(
    formatUnits(
      event.type === 'ACCEPTED'
        ? event.offer.depositHistory[0]
        : event.offer.totalDeposits,
      event.offer.sourceAsset.decimals
    )
  )

  const destAmount = Number(
    formatUnits(event.offer.closeAmount, event.offer.destAsset.decimals)
  )

  const elapsed = Math.ceil(Date.now() / 1000) - Number(event.timestamp)
  const rate =
    event.type === 'ACCEPTED'
      ? fmtNum(
          (event.destAssetPrice * destAmount) /
            (event.sourceAssetPrice * srcAmount)
        )
      : destAssetRate && srcAssetRate
        ? fmtNum((destAssetRate * destAmount) / (srcAssetRate * srcAmount))
        : 'N/A'
  const timeFull = fmtTime(new Date(event.timestamp * 1000).toUTCString())
  const timeAbbr =
    elapsed < 60
      ? 'recent'
      : elapsed < 3600
        ? `${Math.round(elapsed / 60)} mins`
        : `${fmrHr(Math.round(elapsed / 3600))}`

  const target = buildTarget(event.offer.domainName)

  // return (
  //   <SimpleGrid
  //     columns={2}
  //     rowGap={0}
  //     columnGap={4}
  //     width="full"
  //     rounded="md"
  //     boxShadow="base"
  //     border="1px"
  //     borderColor="gray.200"
  //     p="2"
  //     onClick={() => {
  //       window.open(`/offer/${event.offer.domainName}`)
  //     }}
  //     cursor="pointer"
  //     _hover={{ textDecor: 'none', bgColor: 'gray.100' }}
  //   >
  //     <Box textAlign="right">Status</Box>
  //     <Box>{event.type === 'ACCEPTED' ? 'Accepted' : 'Created'}</Box>
  //     <Box textAlign="right">Source Asset</Box>
  //     <AddressField text={event.offer.sourceAsset.label}>
  //       {event.offer.sourceAsset.address}
  //     </AddressField>
  //     <Box textAlign="right">Source Amount</Box>
  //     <Box>{fmtNum(srcAmount)}</Box>
  //     <Box textAlign="right">Destination Asset</Box>
  //     <AddressField text={event.offer.destAsset.label}>
  //       {event.offer.destAsset.address}
  //     </AddressField>
  //     <Box textAlign="right">Accept Amount</Box>
  //     <Box>{fmtNum(destAmount)}</Box>
  //     {event.type === 'CREATED' ? (
  //       <>
  //         <Box textAlign="right">Exchange Rate</Box>
  //         <Box>
  //           {destAssetRate &&
  //             srcAssetRate &&
  //             fmtNum((destAssetRate * destAmount) / (srcAssetRate * srcAmount))}
  //         </Box>
  //       </>
  //     ) : (
  //       <>
  //         <Box textAlign="right">Exchange Rate</Box>
  //         <Box />
  //         <Box textAlign="right">Current</Box>
  //         <Box>
  //           {destAssetRate &&
  //             srcAssetRate &&
  //             fmtNum((destAssetRate * destAmount) / (srcAssetRate * srcAmount))}
  //         </Box>
  //         <Box textAlign="right">Accepted</Box>
  //         <Box>
  //           {fmtNum(
  //             (event.destAssetPrice * destAmount) /
  //               (event.sourceAssetPrice * srcAmount)
  //           )}
  //         </Box>
  //       </>
  //     )}
  //     <Box textAlign="right">Domain Name</Box>
  //     <Box>{event.offer.domainName ?? 'N/A'}</Box>
  //     <Box textAlign="right">Time</Box>
  //     <Box>
  //       {fmtTime(new Date(event.timestamp * 1000).toUTCString())}
  //       <br />
  //       {elapsed < 60
  //         ? 'A few seconds'
  //         : elapsed < 3600
  //           ? `${Math.round(elapsed / 60)} mins`
  //           : fmrHr(Math.round(elapsed / 3600))}{' '}
  //       ago
  //     </Box>
  //   </SimpleGrid>
  // )

  if (asTableRow) {
    return (
      <Tr
        bgColor={event.type === 'ACCEPTED' ? '#eee' : '#efe'}
        color={event.type === 'ACCEPTED' ? 'grey' : 'auto'}
      >
        <Td>
          <Link href={target} target={'_blank'} rel={'noreferrer'}>
            {event.type === 'ACCEPTED' ? 'No' : 'Yes'}
          </Link>
        </Td>
        <Td minWidth={'200px'}>
          {fmtNum(srcAmount)}
          <AddressField text={event.offer.sourceAsset.label} shorten>
            {event.offer.sourceAsset.address}
          </AddressField>
        </Td>
        <Td minWidth={'200px'}>
          <Box>
            {fmtNum(destAmount)}
            <AddressField text={event.offer.destAsset.label} shorten>
              {event.offer.destAsset.address}
            </AddressField>
          </Box>
        </Td>
        <Td>{rate}</Td>
        <Td wordBreak={'break-all'} fontSize={'xs'}>
          <Link href={target} target={'_blank'} rel={'noreferrer'}>
            {`${event.offer.domainName}.${TLD}` ?? 'N/A'}
          </Link>
        </Td>
        <Td>{timeAbbr}</Td>
      </Tr>
    )
  }
  return (
    <Box
      width={60}
      // href={target}
      // target={'_blank'}
      // rel={'noreferrer'}
      // _hover={{ textDecoration: 'none' }}
    >
      <VStack gap={0}>
        <Box
          width={'100%'}
          borderRadius={'8px 8px 0 0'}
          paddingY={1}
          paddingX={2}
          textAlign={'center'}
          background={event.type === 'ACCEPTED' ? 'grey' : 'lightgreen'}
          color={event.type === 'ACCEPTED' ? 'white' : 'auto'}
        >
          <Link
            href={target}
            target={'_blank'}
            rel={'noreferrer'}
            _hover={{ textDecoration: 'none' }}
          >
            <Text>{event.type === 'ACCEPTED' ? 'Filled' : 'Open Offer'}</Text>
          </Link>
        </Box>
        <Box flex={1} width={'100%'} flexDirection={'column'} display={'flex'}>
          <CoinWithAmount
            amountTextSize={'1rem'}
            amount={
              event.type === 'ACCEPTED'
                ? event.offer.depositHistory[0]
                : event.offer.totalDeposits
            }
            {...event.offer.sourceAsset}
            noRoundBottom
            noRoundTop
          />
        </Box>
        <Box
          flex={1}
          width={'100%'}
          display={'flex'}
          justifyContent={'center'}
          background={'#fff'}
        >
          <Box height={'2px'}></Box>
          <Box
            position={'absolute'}
            transform={'translate(-50%,-50%)'}
            background={'white'}
            paddingY={0.5}
            paddingX={1}
            borderRadius={'8px'}
          >
            <ArrowDownIcon width={4} height={4} />
          </Box>
        </Box>
        <Box flex={1} width={'100%'}>
          <CoinWithAmount
            noRoundTop
            noRoundBottom
            amountTextSize={'1rem'}
            amount={event.offer.closeAmount}
            {...event.offer.destAsset}
          />
        </Box>
        <HStack
          width={'100%'}
          background={'#bbb'}
          borderRadius={'0 0 8px 8px'}
          paddingX={2}
          paddingY={1}
          justifyContent={'space-between'}
        >
          <Text color={'#fff'} fontSize={'12px'}>
            Rate: {rate}
          </Text>
          <Text color={'#fff'} fontSize={'8px'}>
            {timeAbbr} ago
          </Text>
        </HStack>
      </VStack>
    </Box>
  )
}

export default Event

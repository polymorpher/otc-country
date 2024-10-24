import React, { useEffect, useState } from 'react'
import { Box, SimpleGrid } from '@chakra-ui/react'
import { type Address, useContractRead } from 'wagmi'
import { formatUnits } from 'viem'
import { getPrice, getAssetByAddress } from '~/helpers/assets'
import AddressField from '~/components/AddressField'
import { fmrHr, fmtNum, fmtTime } from '~/helpers/format'
import { erc20Contract, offerContract } from '~/helpers/contracts'
import useShowError from '~/hooks/useShowError'

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
  simple?: boolean
}

const Event: React.FC<EventProps> = ({ event, simple }) => {
  const showError = useShowError()

  const { data: srcDecimals } = useContractRead({
    ...erc20Contract(event.src_asset as Address),
    functionName: 'decimals',
    onError: (err) => {
      !simple && showError({ title: 'Cannot get source asset decimals', message: err })
      console.error('[Event][src][decimals]', err)
    }
  })

  const { data: destDecimals } = useContractRead({
    ...erc20Contract(event.dest_asset as Address),
    functionName: 'decimals',
    onError: (err) => {
      !simple && showError({ title: 'Cannot get dest asset decimals', message: err })
      console.error('[Event][dest][decimals]', err)
    }
  })

  const { data: domainName } = useContractRead({
    ...offerContract(event.offer_address as Address),
    functionName: 'domainName',
    onError: (err) => {
      !simple && showError({ title: 'Cannot get domain name', message: err })
      console.error('[Event][domainName]', err)
    }
  })

  const srcAsset = getAssetByAddress(event.src_asset)

  const destAsset = getAssetByAddress(event.dest_asset)

  const [srcAssetRate, setSrcAssetRate] = useState<number>()

  const [destAssetRate, setDestAssetRate] = useState<number>()

  useEffect(() => {
    getPrice(srcAsset!.value).then(setSrcAssetRate)
    getPrice(destAsset!.value).then(setDestAssetRate)
  }, [destAsset, srcAsset, event])

  const srcAmount = Number(formatUnits(BigInt(event.total_deposits), Number(srcDecimals)))

  const destAmount = Number(formatUnits(BigInt(event.close_amount), Number(destDecimals)))

  const elapsed = (Date.now() - new Date(event.time).getTime()) / 1000

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
      onClick={() => { window.open(`/offer/${event.domain_name}`) }}
      cursor="pointer"
      _hover={{ textDecor: 'none', bgColor: 'gray.100' }}
    >
      <Box textAlign="right">
        Status
      </Box>
      <Box>
        {event.event_name === 'OfferAccepted' ? 'Accepted' : 'Created'}
      </Box>
      <Box textAlign="right">
        Source Asset
      </Box>
      <AddressField text={srcAsset?.label}>
        {event.src_asset}
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
      <AddressField text={destAsset?.label}>
        {event.dest_asset}
      </AddressField>
      <Box textAlign="right">
        Accept Amount
      </Box>
      <Box>
        {fmtNum(destAmount)}
      </Box>
      {event.event_name === 'OfferCreated'
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
              {fmtNum(Number(event.dest_price) * destAmount / (Number(event.src_price) * srcAmount))}
            </Box>
          </>
          )}
      <Box textAlign="right">
        Domain Name
      </Box>
      <Box>
        {domainName ? String(domainName) : 'N/A'}
      </Box>
      <Box textAlign="right">
        Time
      </Box>
      <Box>
        {fmtTime(event.time)}
        <br/>
        {elapsed < 60 ? 'A few seconds' : elapsed < 3600 ? `${Math.round(elapsed / 60)} mins` : fmrHr(Math.round(elapsed / 3600))} ago
      </Box>
    </SimpleGrid>
  )
}

export default Event

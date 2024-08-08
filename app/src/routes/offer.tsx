import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { readContract } from '@wagmi/core'
import { type Address, isAddress, zeroAddress } from 'viem'
import { Alert, AlertIcon, Box, Spinner } from '@chakra-ui/react'
import { otcContract } from '~/helpers/contracts'
import OfferPage from '~/pages/Offer'
import useShowError from '~/hooks/useShowError'

const Offer: React.FC = () => {
  const { domain } = useParams()

  const [isFetching, setIsFetching] = useState(true)

  const [offerAddress, setOfferAddress] = useState<string>()

  const showError = useShowError()

  useEffect(() => {
    if (!domain || isAddress(domain)) {
      return
    }

    readContract({
      ...otcContract,
      functionName: 'offerAddress',
      args: [domain]
    }).then(res => {
      setOfferAddress(String(res))
    }).catch((err) => {
      showError({ title: `Failed to get offer address of ${domain}`, message: err })
    }).finally(() => {
      setIsFetching(false)
    })
  }, [domain, showError])

  if (!domain) {
    return (
      <Alert status="warning">
        <AlertIcon boxSize="24" />
        Invalid domain
      </Alert>
    )
  }

  if (isAddress(domain)) {
    return <OfferPage address={domain} />
  }

  if (isFetching) {
    return <Box textAlign="center"><Spinner /></Box>
  }

  if (offerAddress === zeroAddress) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Offer is not created
      </Alert>
    )
  }

  return <OfferPage address={offerAddress as Address} />
}

export default Offer

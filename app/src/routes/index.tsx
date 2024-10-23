import React, { useEffect, useState } from 'react'
import { Box, Alert, AlertIcon, Button, Spinner, VStack } from '@chakra-ui/react'
import { readContract } from '@wagmi/core'
import { type Address, zeroAddress } from 'viem'
import { Link } from 'react-router-dom'
import OfferPage from '~/pages/Offer'
import EventHistory from '~/pages/EventHistory'
import { otcContract } from '~/helpers/contracts'
import useShowError from '~/hooks/useShowError'
import { config } from '~/helpers/config'

const hostname = location.hostname.toLowerCase()

const tld = import.meta.env.VITE_TLD

const deployedOnDomain = hostname.endsWith(`.${tld}`) && hostname !== `otc.${tld}`

const LandingPage = () => {
  const [offerAddress, setOfferAddress] = useState<string>()

  const showError = useShowError()

  const [isFetching, setIsFetching] = useState(deployedOnDomain)

  useEffect(() => {
    if (!deployedOnDomain) {
      return
    }

    const [sld] = hostname.split('.')

    readContract(config, {
      ...otcContract,
      functionName: 'offerAddress',
      args: [sld]
    }).then(res => {
      setOfferAddress(String(res))
    }).catch((error) => {
      showError({ title: `Failed to get offer address of ${sld}`, error })
    }).finally(() => {
      setIsFetching(false)
    })
  }, [showError])

  return (
    <VStack spacing={8} w="100%">
      <Button as={Link} to="/new">Create your offer</Button>
      <EventHistory />
      {isFetching && <Box textAlign="center"><Spinner /></Box>}
      {!isFetching && offerAddress === zeroAddress && (
        <Alert status="error">
          <AlertIcon />
          Offer is not created
        </Alert>
      )}
      {!isFetching && offerAddress && offerAddress !== zeroAddress && (
        <OfferPage address={offerAddress as Address} />
      )}
    </VStack>
  )
}

export default LandingPage

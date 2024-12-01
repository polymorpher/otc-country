import React, { useEffect, useState } from 'react'
import {
  Box,
  Alert,
  AlertIcon,
  Button,
  Spinner,
  VStack
} from '@chakra-ui/react'
import { readContract } from '@wagmi/core'
import { type Address, zeroAddress } from 'viem'
import { Link } from 'react-router-dom'
import OfferPage from '~/pages/Offer.js'
import EventHistory from '~/pages/EventHistory.js'
import { otcContract } from '~/helpers/contracts.js'
import useShowError from '~/hooks/useShowError.js'
import * as config from '~/helpers/config.js'

const hostname = location.hostname.toLowerCase()

const deployedOnDomain =
  hostname.endsWith(`.${config.TLD}`) && hostname !== `otc.${config.TLD}`

const LandingPage = () => {
  const [offerAddress, setOfferAddress] = useState<string>()

  const showError = useShowError()

  const [isFetching, setIsFetching] = useState(deployedOnDomain)

  useEffect(() => {
    if (!deployedOnDomain) {
      return
    }

    const [sld] = hostname.split('.')

    readContract(config.config, {
      ...otcContract,
      functionName: 'offerAddress',
      args: [sld]
    })
      .then((res) => {
        setOfferAddress(String(res))
      })
      .catch((error) => {
        showError({ title: `Failed to get offer address of ${sld}`, error })
      })
      .finally(() => {
        setIsFetching(false)
      })
  }, [showError])

  return (
    <VStack spacing={8} w="100%">
      <Button as={Link} to="/new">
        Create your offer
      </Button>
      <EventHistory />
      {isFetching && (
        <Box textAlign="center">
          <Spinner />
        </Box>
      )}
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

import React, { useEffect, useState } from 'react'
import { Box, Text, HStack, Spinner, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useReadContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import client from '~/graphql/client.js'
import { GET_RECENT_EVENTS } from '~/graphql/queries.js'
import Admin from '~/pages/Admin.js'
import NewOffer from '~/pages/NewOffer.js'
import ChainDetector from '~/components/ChainDetector.js'
import type { EventType } from '~/components/Event.js'
import Event from '~/components/Event.js'
import { otcContract } from '~/helpers/contracts.js'
import useShowError from '~/hooks/useShowError.js'
import { config } from '~/helpers/config.js'
import { ErrorType } from '~/helpers/error.js'

const User = () => {
  const showError = useShowError()

  const { data, isLoading, error } = useQuery<{ events: EventType[] }>({
    queryKey: ['events', 'recent'],
    queryFn: () => client.request(GET_RECENT_EVENTS, { recent: 10 })
  })

  useEffect(() => {
    if (error) {
      showError({
        title: 'Failed to show recent offers',
        error,
        type: ErrorType.QUERY
      })
    }
  }, [error, showError])

  return (
    <Box mt={8}>
      {isLoading && <Spinner />}
      <Text textAlign={'center'} fontSize={20}>
        Recent Offers
      </Text>
      <HStack justifyContent={'center'} gap={8} mt={4}>
        {data?.events.map((event, key) => <Event event={event} key={key} />)}
      </HStack>
      <NewOffer />
    </Box>
  )
}

const New = () => {
  const { address, isConnected } = useAccount()

  const showError = useShowError()

  const [isOperator, setIsOperator] = useState<boolean>()

  const { error, data: operatorRoleBytes } = useReadContract({
    ...otcContract,
    functionName: 'OPERATOR_ROLE'
  })

  useEffect(() => {
    if (error) {
      showError({ title: 'Cannot find operators', error })
    }
  }, [error, showError])

  useEffect(() => {
    if (!address || !operatorRoleBytes) {
      return
    }

    readContract(config, {
      ...otcContract,
      functionName: 'hasRole',
      args: [operatorRoleBytes, address]
    })
      .then((res) => {
        setIsOperator(Boolean(res))
      })
      .catch((error) => {
        showError({ title: 'Cannot determine if user is operator', error })
        console.error(error)
      })
  }, [address, operatorRoleBytes, showError])

  return (
    <VStack w="100%">
      <ConnectKitButton />
      <ChainDetector />
      {isConnected && isOperator ? <Admin /> : <User />}
    </VStack>
  )
}

export default New

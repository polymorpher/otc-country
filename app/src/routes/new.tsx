import React, { useEffect, useState } from 'react'
import { SimpleGrid, Spinner, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useReadContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import client from '~/graphql/client'
import { GET_RECENT_EVENTS } from '~/graphql/queries'
import Admin from '~/pages/Admin'
import NewOfferWithDomainName from '~/pages/NewOfferWithDomainName'
import ChainDetector from '~/components/ChainDetector'
import type { EventType } from '~/components/Event'
import Event from '~/components/Event'
import { otcContract } from '~/helpers/contracts'
import useShowError from '~/hooks/useShowError'
import { config } from '~/helpers/config'
import { ErrorType } from '~/helpers/error'

const User = () => {
  const showError = useShowError()

  const { data, isLoading, error } = useQuery<{ events: EventType[] }>({
    queryKey: ['events', 'recent'],
    queryFn: () => client.request(GET_RECENT_EVENTS, { recent: 10 })
  })

  useEffect(() => {
    if (error) {
      showError({ title: 'Failed to show recent offers', error, type: ErrorType.QUERY })
    }
  }, [error, showError])

  return (
    <>
      {isLoading && <Spinner />}
      <SimpleGrid
        columns={[1, 1, 1, 3]}
        rowGap={4}
        columnGap={4}
        fontSize="xs"
        width={['100%', '100%', '100%', '150%', '200%']}
      >
        {data?.events.map((event, key) => (
          <Event event={event} key={key} />
        ))}
      </SimpleGrid>
      <NewOfferWithDomainName />
    </>
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
    }).then((res) => { setIsOperator(Boolean(res)) })
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

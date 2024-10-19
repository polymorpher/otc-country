import React, { useEffect, useState } from 'react'
import { SimpleGrid, Spinner, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query';
import { useAccount, useContractRead } from 'wagmi'
import { readContract } from '@wagmi/core'
import gql from '~/graphql/client'
import { GET_RECENT_EVENTS } from '~/graphql/queries'
import Admin from '~/pages/Admin'
import NewOfferWithDomainName from '~/pages/NewOfferWithDomainName'
import MetamskConnector from '~/components/MetamaskConnector'
import ChainDetector from '~/components/ChainDetector'
import type { EventType } from '~/components/Event'
import Event from '~/components/Event'
import { otcContract } from '~/helpers/contracts'
import useShowError from '~/hooks/useShowError'

const User = () => {
  const showError = useShowError()

  const { data, isLoading, error } = useQuery<EventType[]>({
    queryKey: ['events', 'recent'],
    queryFn: gql.request(GET_RECENT_EVENTS, { recent: 10 }),
  })

  useEffect(() => {
    if (error) {
      showError({ title: 'Failed to show recent offers', message: JSON.stringify(error) }) 
    }
  }, [error])

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
        {data && data.map((event, key) => (
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

  const { data: operatorRoleBytes } = useContractRead({
    ...otcContract,
    functionName: 'OPERATOR_ROLE',
    onError: (err) => {
      showError({ title: 'Cannot find operators', message: err })
      console.error(err)
    }
  })

  useEffect(() => {
    if (!address) {
      return
    }

    readContract({
      ...otcContract,
      functionName: 'hasRole',
      args: [operatorRoleBytes, address]
    }).then((res) => { setIsOperator(Boolean(res)) })
      .catch((err) => {
        showError({ title: 'Cannot determine if user is operator', message: err })
        console.error(err)
      })
  }, [address, operatorRoleBytes, showError])

  return (
    <VStack w="100%">
      <MetamskConnector />
      <ChainDetector />
      {isConnected && isOperator ? <Admin /> : <User />}
    </VStack>
  )
}

export default New

import React, { useEffect, useState } from 'react'
import { SimpleGrid, VStack } from '@chakra-ui/react'
import { useAccount, useContractRead } from 'wagmi'
import Admin from '~/pages/Admin'
import NewOfferWithDomainName from '~/pages/NewOfferWithDomainName'
import MetamskConnector from '~/components/MetamaskConnector'
import ChainDetector from '~/components/ChainDetector'
import type { EventType } from '~/components/Event'
import Event from '~/components/Event'
import { otcContract } from '~/helpers/contracts'
import * as CONFIG from '~/helpers/config'

const User = () => {
  const [events, setEvents] = useState<EventType[]>([])

  useEffect(() => {
    fetch(`${CONFIG.SERVER}?pageSize=3`)
      .then((res) => res.json())
      .then(res => {
        setEvents(res)
      })
      .catch(ex => {
        // TODO
        console.error(ex)
      })
  }, [])

  return (
    <>
      <SimpleGrid
        columns={[1, 1, 1, 3]}
        rowGap={4}
        columnGap={4}
        fontSize="xs"
        width={['100%', '100%', '100%', '150%', '200%']}
      >
        {events.map((event, key) => (
          <Event event={event} key={key} />
        ))}
      </SimpleGrid>
      <NewOfferWithDomainName />
    </>
  )
}

const New = () => {
  const { address, isConnected } = useAccount()

  const { data: operatorRoleBytes } = useContractRead({
    ...otcContract,
    functionName: 'OPERATOR_ROLE',
    onError: (err) => {
      // TODO
      // setError({ details: 'Cannot find operators' })
      console.error(err)
    }
  })

  const { data: isOperator } = useContractRead({
    ...otcContract,
    functionName: 'hasRole',
    args: [operatorRoleBytes, address],
    onError: (err) => {
      // TODO
      // setError({ details: 'Cannot determine if user is operator' })
      console.error(err)
    }
  })

  return (
    <VStack w="100%">
      <MetamskConnector />
      <ChainDetector />
      {isConnected && isOperator ? <Admin /> : <User />}
    </VStack>
  )
}

export default New

import React, { useEffect, useState } from 'react'
import { VStack } from '@chakra-ui/react'
import { useAccount, useContractRead } from 'wagmi'
import Admin from '~/pages/Admin'
import DomainNameForm from '~/pages/DomainNameForm'
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
  }, [])

  return (
    <>
      {events.map((event, key) => (
        <Event event={event} key={key} />
      ))}
      <DomainNameForm />
    </>
  )
}

const New = () => {
  const { address, isConnected } = useAccount()

  const { data: operatorRoleBytes } = useContractRead({
    ...otcContract,
    functionName: 'OPERATOR_ROLE'
  })

  const { data: isOperator } = useContractRead({
    ...otcContract,
    functionName: 'hasRole',
    args: [operatorRoleBytes, address]
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

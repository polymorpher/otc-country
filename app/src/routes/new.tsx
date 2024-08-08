import React, { useEffect, useState } from 'react'
import { SimpleGrid, VStack } from '@chakra-ui/react'
import { useAccount, useContractRead } from 'wagmi'
import { readContract } from '@wagmi/core'
import Admin from '~/pages/Admin'
import NewOfferWithDomainName from '~/pages/NewOfferWithDomainName'
import MetamskConnector from '~/components/MetamaskConnector'
import ChainDetector from '~/components/ChainDetector'
import type { EventType } from '~/components/Event'
import { useShowError } from '~/providers/ErrorProvider'
import Event from '~/components/Event'
import { otcContract } from '~/helpers/contracts'
import * as CONFIG from '~/helpers/config'

const User = () => {
  const [events, setEvents] = useState<EventType[]>([])
  const showError = useShowError()

  useEffect(() => {
    fetch(`${CONFIG.SERVER}?pageSize=3`)
      .then((res) => res.json())
      .then(res => {
        setEvents(res)
      })
      .catch(ex => {
        showError({ title: 'Failed to show recent offers', message: ex })
      })
  }, [showError])

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

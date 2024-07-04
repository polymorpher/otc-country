import React, { useState, useEffect, useCallback } from 'react'
import { Alert, AlertIcon, Spinner, Text, VStack } from '@chakra-ui/react'
import { readContract } from '@wagmi/core'
import { type Address } from 'abitype'
import { zeroAddress } from 'viem'
import { useAccount, useContractRead } from 'wagmi'
import DomainInput from '~/components/DomainInput'
import { otcContract } from '~/helpers/contracts'
import Admin from '~/pages/Admin'
import NewOffer from '~/pages/NewOffer'
import Offer from '~/pages/Offer'
import { newName } from '~/helpers/names'

const App = (): React.JSX.Element => {
  const { address, isConnected } = useAccount()

  const [domain, setDomain] = useState<string>(newName())

  const [isFetching, setIsFetching] = useState<boolean>(false)

  const [offerAddress, setOfferAddress] = useState<Address>()

  const [error, setError] = useState<any>()

  const { data: ownerAddress } = useContractRead({
    ...otcContract,
    functionName: 'owner'
  })

  const refetch = useCallback((domain: string) => {
    if (!domain) {
      return
    }

    setError(undefined)
    setOfferAddress(undefined)
    setIsFetching(true)

    readContract({
      ...otcContract,
      functionName: 'offerAddress',
      args: [domain]
    })
      .then((res) => { setOfferAddress(res as Address) })
      .catch(setError)
      .finally(() => { setIsFetching(false) })
  }, [])

  useEffect(() => {
    refetch('')
  }, [refetch])

  const handleDomainChange = useCallback(
    (value: string) => {
      console.log(value)
      setDomain(value)
      refetch(value)
    },
    [refetch]
  )

  if (isConnected && ownerAddress === address) {
    return <Admin />
  }

  return (
    <VStack width="full">
      <Text fontSize={24} m={8}>Create a new offer</Text>
      <DomainInput value={domain} onChange={handleDomainChange} loading={!error && isFetching} />
      <Text>Buy a new domain, or use an existing one</Text>
      {!domain && <Alert status="warning">
        <AlertIcon />
        Please select the domain name you want to purchase
      </Alert> }
      {!isFetching && offerAddress && offerAddress !== zeroAddress &&
      <VStack>
        <Alert status="error">
          <AlertIcon />
          There is already an offer at this domain
        </Alert>

        <Offer address={offerAddress } />
      </VStack>
      }
      {!isFetching && offerAddress &&
      <NewOffer domain={domain} onCreate={() => { refetch(domain) }} />
      }

      {error && (
        <Alert status="error" wordBreak="break-word">
          <AlertIcon />
          {error.details}
        </Alert>
      )}
    </VStack>
  )
}

export default App

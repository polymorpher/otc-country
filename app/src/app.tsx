import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Alert, AlertIcon, Spinner, Text, VStack } from '@chakra-ui/react'
import { readContract } from '@wagmi/core'
import { type Address } from 'abitype'
import { zeroAddress } from 'viem'
import { useAccount, useContractRead } from 'wagmi'
import DomainInput from '~/components/DomainInput'
import { domainContract, otcContract } from '~/helpers/contracts'
import Admin from '~/pages/Admin'
import NewOffer from '~/pages/NewOffer'
import Offer from '~/pages/Offer'
import { newName } from '~/helpers/names'
import debounce from 'lodash.debounce'

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

  const { data: domainContractAddress } = useContractRead({
    ...otcContract,
    functionName: 'domainContract'
  })

  const onDomainChange = useCallback(async (domain: string) => {
    if (!domain) {
      return
    }

    console.log(domain)

    setError(undefined)
    setOfferAddress(undefined)
    setIsFetching(true)

    const [res1, res2] = await Promise.all([
      readContract({
        ...domainContract(domainContractAddress as Address),
        functionName: 'available',
        args: [domain]
      }),

      fetch('https://1ns-registrar-relayer.hiddenstate.xyz/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sld: domain })
      }).then(async (res) => await res.json()).then(res => res.isAvailable)
    ])

    if (!res1 || !res2) {
      setError({ details: 'The domain is not available. Please choose another domain name' })
      setIsFetching(false)
      return
    }

    readContract({
      ...otcContract,
      functionName: 'offerAddress',
      args: [domain]
    })
      .then((res) => { setOfferAddress(res as Address) })
      .catch(setError)
      .finally(() => { setIsFetching(false) })
  }, [domainContractAddress])

  const refetch = useMemo(
    () => debounce(onDomainChange, 300),
    [onDomainChange]
  )

  useEffect(() => {
    refetch('')
  }, [refetch])

  const handleDomainChange = useCallback(
    (value: string) => {
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
      {isFetching && <Spinner/>}
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

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Alert, AlertIcon, Text, VStack } from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import { readContract } from '@wagmi/core'
import { type Address } from 'abitype'
import { zeroAddress } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import DomainInput from '~/components/DomainInput'
import { idcContract, otcContract } from '~/helpers/contracts'
import { newName } from '~/helpers/names'
import NewOffer from '~/pages/NewOffer'
import Offer from '~/pages/Offer'
import useShowError from '~/hooks/useShowError'
import { config } from '~/helpers/config'

const NewOfferWithDomainName = (): React.JSX.Element => {
  const { isConnected, address } = useAccount()

  const [isFetching, setIsFetching] = useState<boolean>(false)

  const [offerAddress, setOfferAddress] = useState<Address>()

  const [error, setError] = useState<any>()

  const showError = useShowError()

  const { error: domainContractError, data: dcAddress } = useReadContract({
    ...otcContract,
    functionName: 'domainContract'
  })

  useEffect(() => {
    if (domainContractError) {
      showError({ title: 'Cannot find .country contract on-chain', error: domainContractError })
    }
  }, [domainContractError, showError])

  const onDomainChange = useCallback(async (domain: string) => {
    if (!domain) {
      return
    }

    if (!dcAddress) {
      return
    }

    setError(undefined)
    setOfferAddress(undefined)
    setIsFetching(true)

    const [isAvailableOnChain, isAvailableOffChain] = await Promise.all([
      readContract(config, {
        ...idcContract(dcAddress as Address),
        functionName: 'available',
        args: [domain]
      }),

      fetch('https://1ns-registrar-relayer.hiddenstate.xyz/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sld: domain })
      }).then(async (res) => await res.json()).then(res => res.isAvailable)
    ]).catch(ex => {
      console.error(ex)
      return []
    })

    const isAvailable = isAvailableOnChain && isAvailableOffChain

    if (!isAvailable) {
      const owner = await readContract(config, {
        ...idcContract(dcAddress as Address),
        functionName: 'ownerOf',
        args: [domain]
      }).catch(ex => {
        console.log(`Domain ${domain} does not exist on-chain or is expired`)
        return undefined
      })

      if (!owner || owner !== address) {
        setError({ details: 'The domain is not available. Please choose another domain name' })
        setIsFetching(false)
        return
      }
    }

    readContract(config, {
      ...otcContract,
      functionName: 'offerAddress',
      args: [domain]
    })
      .then((res) => { setOfferAddress(res as Address) })
      .catch(setError)
      .finally(() => { setIsFetching(false) })
  }, [address, dcAddress])

  const refetch = useMemo(
    () => debounce(onDomainChange, 300),
    [onDomainChange]
  )

  const defaultDomain = useRef(newName())

  const [domain, setDomain] = useState<string>(defaultDomain.current)

  useEffect(() => {
    if (dcAddress) {
      onDomainChange(defaultDomain.current)
    }
  }, [onDomainChange, dcAddress])

  const handleDomainChange = useCallback(
    (value: string) => {
      setDomain(value)
      refetch(value)
      defaultDomain.current = value
    },
    [refetch]
  )

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

        <Offer address={offerAddress} />
      </VStack>
      }
      {!isFetching && offerAddress === zeroAddress && !isConnected && (
        <Alert status="info">
          <AlertIcon />
          Please connect your wallet to proceed.
        </Alert>
      )}
      {!isFetching && offerAddress === zeroAddress && isConnected &&
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

export default NewOfferWithDomainName

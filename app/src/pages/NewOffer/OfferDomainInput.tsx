import React, { useCallback, useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { config } from '~/helpers/config.js'
import { idcContract, otcContract } from '~/helpers/contracts.js'
import type { Address } from 'abitype'
import { useAccount } from 'wagmi'
import useShowError from '~/hooks/useShowError.js'
import { useDebounce } from 'use-debounce'
import DomainInput from '~/components/DomainInput.js'
import {
  Alert,
  AlertIcon,
  Button,
  HStack,
  Input,
  Text,
  VStack
} from '@chakra-ui/react'
import { formatEther, zeroAddress } from 'viem'
import Offer from '~/pages/Offer.js'
import { useNewDomain } from '~/hooks/useNewOfferHooks.js'

interface OfferDomainInputProps {
  setOfferAddress: (address?: Address) => void
  setIsFetching: (isFetching: boolean) => void
  isFetching: boolean
  offerAddress?: Address
  domain: string
  setDomain: (domain: string) => void
  onNext: () => any
  onPrev: () => any
}

const OfferDomainInput: React.FC<OfferDomainInputProps> = ({
  setOfferAddress,
  setIsFetching,
  isFetching,
  offerAddress,
  domain,
  setDomain,
  onPrev,
  onNext
}) => {
  const { isConnected, address } = useAccount()
  const [error, setError] = useState<any>()
  const showError = useShowError()
  const [debouncedDomain] = useDebounce(domain, 300)

  const { domainOwner, domainPrice, balance, dcAddress, domainContractError } =
    useNewDomain(domain)

  const onDomainChange = useCallback(
    async (newDomain: string) => {
      if (!newDomain) {
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
          ...idcContract(dcAddress),
          functionName: 'available',
          args: [newDomain]
        }),

        fetch('https://1ns-registrar-relayer.hiddenstate.xyz/check-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sld: newDomain })
        })
          .then(async (res) => await res.json())
          .then((res) => res.isAvailable)
      ]).catch((ex) => {
        console.error(ex)
        return []
      })

      const isAvailable = isAvailableOnChain && isAvailableOffChain

      if (!isAvailable) {
        const owner = await readContract(config, {
          ...idcContract(dcAddress),
          functionName: 'ownerOf',
          args: [newDomain]
        }).catch((ex) => {
          console.log(
            `Domain ${newDomain} does not exist on-chain or is expired`
          )
          return undefined
        })

        if (!owner || owner !== address) {
          setError({
            details:
              'The domain is not available. Please choose another domain name'
          })
          setIsFetching(false)
          return
        }
      }

      readContract(config, {
        ...otcContract,
        functionName: 'offerAddress',
        args: [newDomain]
      })
        .then((res) => {
          setOfferAddress(res as Address)
        })
        .catch(setError)
        .finally(() => {
          setIsFetching(false)
        })
    },
    [setIsFetching, setOfferAddress, address, dcAddress]
  )

  useEffect(() => {
    onDomainChange(debouncedDomain).catch((ex: any) => {
      setError(ex.toString())
    })
  }, [debouncedDomain, onDomainChange])

  useEffect(() => {
    if (domainContractError) {
      showError({
        title: 'Cannot find .country contract on-chain',
        error: domainContractError
      })
    }
  }, [domainContractError, showError])

  return (
    <VStack width="600px">
      <Text color={'grey'} fontSize={10} width={'100%'}>
        Buy a new domain, or use one you already own
      </Text>
      <DomainInput
        value={domain}
        onChange={setDomain}
        loading={!error && isFetching}
      />
      {!domain && (
        <Alert status="warning">
          <AlertIcon />
          Please select the domain name you want to purchase
        </Alert>
      )}

      {!isFetching && offerAddress && offerAddress !== zeroAddress && (
        <VStack>
          <Alert status="error">
            <AlertIcon />
            There is already an offer at this domain
          </Alert>

          <Offer address={offerAddress} />
        </VStack>
      )}
      {!isFetching && offerAddress === zeroAddress && !isConnected && (
        <Alert status="info">
          <AlertIcon />
          Please connect your wallet to proceed.
        </Alert>
      )}
      {domainOwner === address ? (
        <Alert status="success">
          <AlertIcon />
          You already own the domain
        </Alert>
      ) : (
        <>
          <Text fontSize="2xl" my="10">
            Choose an available domain for your offer
          </Text>

          {domainPrice !== undefined && (
            <Alert status={balance > domainPrice ? 'info' : 'warning'}>
              <AlertIcon />
              Domain cost: {formatEther(domainPrice)} ONE <br />
              {balance > domainPrice
                ? 'You will own the domain. Your offer will be hosted there.'
                : 'You have insufficient fund'}
            </Alert>
          )}
        </>
      )}
      <HStack>
        <Button onClick={onPrev}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </HStack>
    </VStack>
  )
}

export default OfferDomainInput

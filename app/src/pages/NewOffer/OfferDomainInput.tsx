import React, { useCallback, useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { config, TLD } from '~/helpers/config.js'
import { idcContract, otcContract } from '~/helpers/contracts.js'
import type { Address } from 'abitype'
import { useAccount } from 'wagmi'
import useShowError from '~/hooks/useShowError.js'
import DomainInput from '~/components/DomainInput.js'
import { Box, Button, HStack, Link, Text, VStack } from '@chakra-ui/react'
import { formatEther, zeroAddress } from 'viem'
import { useNewDomain } from '~/hooks/useNewOfferHooks.js'
import { buildTarget } from '~/helpers/link.js'
import { useDebounce } from 'use-debounce'

interface OfferDomainInputProps {
  domain: string
  setDomain: (domain: string) => void
  onNext: () => any
  onPrev: () => any
}

const OfferDomainInput: React.FC<OfferDomainInputProps> = ({
  domain: domainState,
  setDomain,
  onPrev,
  onNext
}) => {
  const { isConnected, address } = useAccount()
  const [error, setError] = useState<string | undefined>('')
  const showError = useShowError()
  const [canDeployToAddress, setCanDeployToAddress] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [domain] = useDebounce(domainState, 500)
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
      setCanDeployToAddress(false)
      setIsFetching(true)

      const availabilityCheck: [boolean, boolean] | undefined =
        await Promise.all([
          readContract(config, {
            ...idcContract(dcAddress),
            functionName: 'available',
            args: [newDomain]
          }) as Promise<boolean>,

          fetch('https://1ns-registrar-relayer.hiddenstate.xyz/check-domain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sld: newDomain })
          })
            .then(async (res) => await res.json())
            .then((res) => res.isAvailable as boolean)
        ]).catch((ex) => {
          console.error(ex)
          return undefined
        })
      if (availabilityCheck === undefined) {
        setError('Failed to check domain availability. Please try again later')
        setIsFetching(false)
        return
      }

      const [isAvailableOnChain, isAvailableOffChain] = availabilityCheck

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
          setError(
            'The domain is not available. Please choose another domain name'
          )
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
          console.log(newDomain, res)
          setCanDeployToAddress((res as Address) === zeroAddress)
        })
        .catch((ex: any) => {
          setError(ex.toString())
        })
        .finally(() => {
          setIsFetching(false)
        })
    },
    [address, dcAddress]
  )

  useEffect(() => {
    onDomainChange(domain).catch((ex: any) => {
      setError(ex.toString())
    })
  }, [domain, onDomainChange])

  useEffect(() => {
    if (domainContractError) {
      showError({
        title: 'Cannot find .country contract on-chain',
        error: domainContractError
      })
    }
  }, [domainContractError, showError])

  const canProceed =
    !isFetching &&
    isConnected &&
    ((canDeployToAddress && balance > domainPrice) || domainOwner === address)

  // console.log('canProceed', canProceed)
  return (
    <VStack width="600px">
      <Text color={'grey'} fontSize={10} width={'100%'}>
        Buy a new domain, or use one you already own
      </Text>
      <DomainInput
        value={domainState}
        onChange={setDomain}
        loading={!error && isFetching}
      />
      <Box width={'100%'} textAlign={'left'} fontSize={10}>
        {isFetching && <Text color={'grey'}>Checking status of domain...</Text>}
        {!isFetching && error && <Text color={'red'}>{error}</Text>}
        {!isFetching && !canDeployToAddress && (
          <Text color={'red'}>
            There is already an offer at this domain:{' '}
            <Link href={buildTarget(domain)} target="_blank">
              <b>
                {domain}.{TLD}
              </b>
            </Link>
          </Text>
        )}
        {!isFetching && !isConnected && (
          <Text color={'red'}>Please connect your wallet to proceed</Text>
        )}
        {!isFetching && domainOwner === address && !canDeployToAddress && (
          <Text color={'green'}>You already own the domain</Text>
        )}
        {!isFetching &&
          domainOwner !== address &&
          canDeployToAddress &&
          domainPrice !== undefined &&
          balance > domainPrice && (
            <Text color={'black'}>
              <b>
                {domain}.{TLD}
              </b>{' '}
              will cost you {formatEther(domainPrice)} ONE
            </Text>
          )}
        {!isFetching &&
          domainOwner !== address &&
          canDeployToAddress &&
          domainPrice !== undefined &&
          !(balance > domainPrice) && (
            <Text color={'red'}>
              {domain}.{TLD} costs {formatEther(domainPrice)} ONE. You have
              insufficient funds.
            </Text>
          )}
      </Box>
      <HStack width={'100%'} mt={4} justifyContent={'space-between'}>
        <Button onClick={onPrev}>Back</Button>
        <Button onClick={onNext} isDisabled={!canProceed}>
          Next
        </Button>
      </HStack>
    </VStack>
  )
}

export default OfferDomainInput

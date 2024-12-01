import { useCallback } from 'react'
import { type Address } from 'abitype'
import { type Hex, keccak256, toHex } from 'viem'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import { idcContract, erc20Contract, otcContract } from '~/helpers/contracts.js'
import useContractWriteComplete from './useContractWriteComplete.js'

interface Config {
  srcAsset: Address
  destAsset: Address
  domain: string
}

interface OfferData {
  domainOwner: Address
  srcAsset: Address
  destAsset: Address
  depositAmount: bigint
  acceptAmount: bigint
  commissionRate: bigint
  lockWithdrawDuration: bigint
}

export interface UseNewOfferType {
  balance: bigint
  srcBalance: bigint
  srcDecimals: bigint
  destDecimals: bigint
  domainPrice: bigint
  isCreatingOffer: boolean
  domainOwner: Address
  createOffer: (d: OfferData) => any
  registerWeb2Domain: (txHash: Hex, address: Address, domain: string) => any
  setDns: (txHash: Hex, domain: string) => any
  generateMetadata: (domain: string) => any
}

const useNewOffer = ({
  srcAsset,
  destAsset,
  domain
}: Config): UseNewOfferType => {
  const { address } = useAccount()

  const { data: balance } = useBalance({ address })

  const { data: domainContractAddress } = useReadContract({
    ...otcContract,
    functionName: 'domainContract'
  })

  const { data: domainPrice } = useReadContract({
    ...idcContract(domainContractAddress as Address),
    functionName: 'getPrice',
    args: [domain]
  })

  const { data: domainOwner } = useReadContract({
    ...idcContract(domainContractAddress as Address),
    functionName: 'ownerOf',
    args: [domain]
  })

  const { data: srcBalance } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'balanceOf',
    args: [address]
  })

  const { data: computedOfferAddress } = useReadContract({
    ...otcContract,
    functionName: 'computedOfferAddress',
    args: [domain]
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'allowance',
    args: [address, computedOfferAddress]
  })

  const { data: srcDecimals } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'decimals'
  })

  const { data: destDecimals } = useReadContract({
    ...erc20Contract(destAsset),
    functionName: 'decimals'
  })

  const { writeAsync: approveSrcAsset, status: approveStatus } =
    useContractWriteComplete({
      ...erc20Contract(srcAsset),
      functionName: 'approve'
    })

  const { writeAsync: createOfferAsync, status: createOfferStatus } =
    useContractWriteComplete({
      ...otcContract,
      functionName: 'createOffer'
    })

  const generateMetadata = useCallback(async (domain: string) => {
    return await fetch('https://1ns-registrar-relayer.hiddenstate.xyz/gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain })
    })
      .then(async (res) => await res.json())
      .then((res) => ({
        success: res.generated as boolean,
        error: res.error ? (res.error as string) : undefined
      }))
  }, [])

  const registerWeb2Domain = useCallback(
    async (txHash: Hex, address: Address, domain: string) => {
      return await fetch(
        'https://1ns-registrar-relayer.hiddenstate.xyz/purchase',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, address, txHash, fast: true })
        }
      )
        .then(async (res) => await res.json())
        .then((res) => ({
          success: res.success as boolean,
          error: res.error ? (res.error as string) : undefined
        }))
    },
    []
  )

  const setDns = useCallback(async (txHash: Hex, domain: string) => {
    return await fetch(
      'https://1ns-registrar-relayer.hiddenstate.xyz/app/otc',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, txHash })
      }
    )
      .then(async (res) => await res.json())
      .then((res) => ({
        success: res.success as boolean,
        error: res.error ? (res.error as string) : undefined
      }))
  }, [])

  const createOffer = useCallback(
    async ({
      domainOwner,
      srcAsset,
      destAsset,
      depositAmount,
      acceptAmount,
      commissionRate,
      lockWithdrawDuration
    }: OfferData) => {
      await refetchAllowance()

      if ((allowance as bigint) < depositAmount) {
        await approveSrcAsset([computedOfferAddress, depositAmount], {
          pendingTitle: 'Approving deposition',
          failTitle: 'Failed to approve',
          successTitle: 'Deposition has been approved'
        })
      }

      return await createOfferAsync(
        [
          domain,
          keccak256(toHex(Math.random().toString())),
          domainOwner,
          srcAsset,
          destAsset,
          depositAmount,
          acceptAmount,
          commissionRate,
          lockWithdrawDuration
        ],
        {
          pendingTitle: 'Creating offer',
          failTitle: 'Failed to create the offer',
          successTitle: 'Offer has been approved'
        },
        domainPrice as bigint
      )
    },
    [
      allowance,
      approveSrcAsset,
      computedOfferAddress,
      createOfferAsync,
      domain,
      domainPrice,
      refetchAllowance
    ]
  )

  return {
    balance: balance?.value as bigint,
    srcBalance: srcBalance as bigint,
    srcDecimals: srcDecimals as bigint,
    destDecimals: destDecimals as bigint,
    domainPrice: domainPrice as bigint,
    isCreatingOffer:
      approveStatus === 'pending' || createOfferStatus === 'pending',
    createOffer,
    registerWeb2Domain,
    generateMetadata,
    setDns,
    domainOwner: domainOwner as Address
  }
}

export default useNewOffer

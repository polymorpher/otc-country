import { useCallback } from 'react'
import { type Address } from 'abitype'
import { type Hex, keccak256, toHex } from 'viem'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import {
  idcContract,
  erc20Contract,
  otcContract,
  erc20MetadataContract
} from '~/helpers/contracts.js'
import useContractWriteComplete from './useContractWriteComplete.js'
import { type AssetInfo, AssetLookup } from '~/helpers/assets.js'

interface UseAssetsProps {
  srcAsset: Address
  destAsset: Address
}

interface UseNewOfferProps {
  srcAsset: Address
  domain: string
  domainPrice: bigint
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

export interface UseNewOfferInfo {
  isCreatingOffer: boolean
  createOffer: (d: OfferData) => any
}
export interface UseNewDomainInfo {
  dcAddress: Address
  domainContractError: any
  domainPrice: bigint
  balance: bigint
  domainOwner: Address
  registerWeb2Domain: (txHash: Hex, address: Address, domain: string) => any
  setDns: (txHash: Hex, domain: string) => any
  generateMetadata: (domain: string) => any
}
export interface UseAssetInfo {
  srcAsset: Address
  destAsset: Address
  srcSymbol: string
  destSymbol: string
  srcBalance: bigint
  destBalance: bigint
  srcDecimals: bigint
  destDecimals: bigint
  srcInfo?: AssetInfo
  destInfo?: AssetInfo
}

export const useNewDomain = (domain: string): UseNewDomainInfo => {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { error: domainContractError, data: dcAddress } = useReadContract({
    ...otcContract,
    functionName: 'domainContract'
  })

  const { data: domainPrice } = useReadContract({
    ...idcContract(dcAddress as Address),
    functionName: 'getPrice',
    args: [domain]
  })

  const { data: domainOwner } = useReadContract({
    ...idcContract(dcAddress as Address),
    functionName: 'ownerOf',
    args: [domain]
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

  return {
    balance: balance?.value as bigint,
    domainPrice: domainPrice as bigint,
    domainOwner: domainOwner as Address,
    domainContractError,
    dcAddress: dcAddress as Address,
    registerWeb2Domain,
    generateMetadata,
    setDns
  }
}
export const useAssets = ({
  srcAsset,
  destAsset
}: UseAssetsProps): UseAssetInfo => {
  const { address } = useAccount()

  const { data: srcBalance } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'balanceOf',
    args: [address]
  })
  const { data: destBalance } = useReadContract({
    ...erc20Contract(destAsset),
    functionName: 'balanceOf',
    args: [address]
  })

  const { data: srcSymbol } = useReadContract({
    ...erc20MetadataContract(srcAsset),
    functionName: 'symbol'
  })

  const { data: destSymbol } = useReadContract({
    ...erc20MetadataContract(srcAsset),
    functionName: 'symbol'
  })

  const { data: srcDecimals } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'decimals'
  })

  const { data: destDecimals } = useReadContract({
    ...erc20Contract(destAsset),
    functionName: 'decimals'
  })

  const srcInfo = AssetLookup[srcAsset.toLowerCase()]
  const destInfo = AssetLookup[destAsset.toLowerCase()]
  return {
    srcAsset,
    destAsset,
    srcInfo,
    destInfo,
    srcSymbol: srcSymbol as string,
    destSymbol: destSymbol as string,
    srcBalance: srcBalance as bigint,
    destBalance: destBalance as bigint,
    srcDecimals: srcDecimals as bigint,
    destDecimals: destDecimals as bigint
  }
}
export const useNewOffer = ({
  srcAsset,
  domain,
  domainPrice
}: UseNewOfferProps): UseNewOfferInfo => {
  const { data: computedOfferAddress } = useReadContract({
    ...otcContract,
    functionName: 'computedOfferAddress',
    args: [domain]
  })

  const { address } = useAccount()

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

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'allowance',
    args: [address, computedOfferAddress]
  })

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
        domainPrice
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
    isCreatingOffer:
      approveStatus === 'pending' || createOfferStatus === 'pending',
    createOffer
  }
}

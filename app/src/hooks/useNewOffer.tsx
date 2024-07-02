import { useCallback } from 'react'
import { type Address } from 'abitype'
import { keccak256, toHex } from 'viem'
import { useAccount, useBalance, useContractRead } from 'wagmi'
import { domainContract, erc20Contract, otcContract } from '~/helpers/contracts'
import useContractWriteComplete, { type SettledHandler, type SuccessHandler } from './useContractWriteComplete'

interface Config {
  srcAsset: Address
  destAsset: Address
  chainId: number
  domain: string
  onSettled: SettledHandler
  onSuccess: SuccessHandler
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
  createOffer: (d: OfferData) => any
}

const useNewOffer = ({ srcAsset, destAsset, domain, chainId, onSuccess, onSettled }: Config): UseNewOfferType => {
  const { address } = useAccount()

  const { data: balance } = useBalance({
    address,
    chainId
  })

  const { data: domainContractAddress } = useContractRead({
    ...otcContract,
    functionName: 'domainContract'
  })

  const { data: domainPrice } = useContractRead({
    ...domainContract(domainContractAddress as Address),
    functionName: 'getPrice',
    args: [domain]
  })

  const { data: srcBalance } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'balanceOf',
    args: [address]
  })

  const { data: computedOfferAddress } = useContractRead({
    ...otcContract,
    functionName: 'computedOfferAddress',
    args: [domain]
  })

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'allowance',
    args: [address, computedOfferAddress]
  })

  const { data: srcDecimals } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'decimals'
  })

  const { data: destDecimals } = useContractRead({
    ...erc20Contract(destAsset),
    functionName: 'decimals'
  })

  const { writeAsync: approveSrcAsset, isLoading: isApproving } = useContractWriteComplete({
    ...erc20Contract(srcAsset),
    functionName: 'approve',
    description: 'Approving deposition',
    onSettled
  })

  const { writeAsync: createOfferAsync, isLoading: isCreatingOffer } = useContractWriteComplete({
    ...otcContract,
    functionName: 'createOffer',
    description: 'Creating offer',
    onSettled,
    onSuccess
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
        await approveSrcAsset?.({ args: [computedOfferAddress, depositAmount] })
      }

      return await createOfferAsync?.({
        args: [
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
        value: domainPrice as bigint
      })
    },
    [allowance, approveSrcAsset, computedOfferAddress, createOfferAsync, domain, domainPrice, refetchAllowance]
  )

  return {
    balance: balance?.value as bigint,
    srcBalance: srcBalance as bigint,
    srcDecimals: srcDecimals as bigint,
    destDecimals: destDecimals as bigint,
    domainPrice: domainPrice as bigint,
    isCreatingOffer: isApproving || isCreatingOffer,
    createOffer
  }
}

export default useNewOffer

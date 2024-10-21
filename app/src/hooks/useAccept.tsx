import { useCallback } from 'react'
import { type Address } from 'abitype'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Contract, offerContract } from '~/helpers/contracts'
import useContractWriteComplete, { type SettledHandler, type SuccessHandler } from './useContractWriteComplete'

interface Config {
  offerAddress: Address
  destAsset: Address
  acceptAmount: bigint
  onSuccess: SuccessHandler
  onSettled: SettledHandler
}

export interface UseAcceptType {
  destBalance: bigint
  acceptAmount: bigint
  isLoading: boolean
  onAccept: () => Promise<void>
}

const useAccept = ({ offerAddress, destAsset, acceptAmount, onSuccess, onSettled }: Config): UseAcceptType => {
  const { address: userAddress } = useAccount()

  const { data: destBalance } = useReadContract({
    ...erc20Contract(destAsset),
    functionName: 'balanceOf',
    args: [userAddress]
  }) as { data: bigint }

  const { data: allowance } = useReadContract({
    ...erc20Contract(destAsset),
    functionName: 'allowance',
    args: [userAddress, offerAddress]
  }) as { data: bigint }

  const { writeAsync: acceptOffer, isLoading: isAccepting } = useContractWriteComplete({
    ...offerContract(offerAddress),
    functionName: 'accept',
    description: 'Accepting offer',
    onSuccess,
    onSettled
  })

  const { writeAsync: approveDestAsset, isLoading: isApproving } = useContractWriteComplete({
    ...erc20Contract(destAsset),
    functionName: 'approve',
    description: 'Approving accept',
    onSettled
  })

  const onAccept = useCallback(async () => {
    if (allowance < acceptAmount) {
      await approveDestAsset?.({ args: [offerAddress, acceptAmount] })
    }

    await acceptOffer?.({ args: [userAddress] })
  }, [acceptAmount, acceptOffer, allowance, approveDestAsset, offerAddress, userAddress])

  return {
    destBalance,
    acceptAmount,
    isLoading: isAccepting || isApproving,
    onAccept
  }
}

export default useAccept

import { useCallback } from 'react'
import { type Address } from 'abitype'
import type { waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Contract, offerContract } from '~/helpers/contracts.js'
import useContractWriteComplete from './useContractWriteComplete.js'

interface Config {
  offerAddress: Address
  destAsset: Address
  acceptAmount: bigint
}

export interface UseAcceptType {
  destBalance: bigint
  acceptAmount: bigint
  isLoading: boolean
  onAccept: () => Promise<ReturnType<typeof waitForTransactionReceipt>>
}

const useAccept = ({
  offerAddress,
  destAsset,
  acceptAmount
}: Config): UseAcceptType => {
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

  const { writeAsync: acceptOffer, status: acceptStatus } =
    useContractWriteComplete({
      ...offerContract(offerAddress),
      functionName: 'accept'
    })

  const { writeAsync: approveDestAsset, status: approveStatus } =
    useContractWriteComplete({
      ...erc20Contract(destAsset),
      functionName: 'approve'
    })

  const onAccept = useCallback(async (): Promise<
    ReturnType<typeof waitForTransactionReceipt>
  > => {
    if (allowance < acceptAmount) {
      await approveDestAsset([offerAddress, acceptAmount], {
        pendingTitle: 'Approving contract to use your tokens',
        failTitle: 'Failed to finalize approval',
        successTitle: 'Contract has been approved to use your tokens'
      })
    }

    return await acceptOffer([userAddress], {
      pendingTitle: 'Accepting offer',
      failTitle: 'Failed to accept the offer',
      successTitle: 'Offer has been accepted successfully'
    })
  }, [
    acceptAmount,
    acceptOffer,
    allowance,
    approveDestAsset,
    offerAddress,
    userAddress
  ])

  return {
    destBalance,
    acceptAmount,
    isLoading: acceptStatus === 'pending' || approveStatus === 'pending',
    onAccept
  }
}

export default useAccept

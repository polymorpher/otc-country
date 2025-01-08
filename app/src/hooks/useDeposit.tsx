import { useCallback } from 'react'
import { type Address } from 'abitype'
import type { waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Contract, offerContract } from '~/helpers/contracts.js'
import useContractWriteComplete from './useContractWriteComplete.js'

interface Config {
  offerAddress: Address
  srcAsset: Address
}

const useDeposit = ({
  offerAddress,
  srcAsset
}: Config): {
  depositFund: (
    amount: bigint
  ) => Promise<ReturnType<typeof waitForTransactionReceipt>>
  isDepositing: boolean
} => {
  const { address } = useAccount()

  const { writeAsync: approveSrcAsset, status: approveStatus } =
    useContractWriteComplete({
      ...erc20Contract(srcAsset),
      functionName: 'approve'
    })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'allowance',
    args: [address, offerAddress]
  })

  const { writeAsync: deposit, status: depositStatus } =
    useContractWriteComplete({
      ...offerContract(offerAddress),
      functionName: 'deposit'
    })

  const depositFund = useCallback(
    async (
      amount: bigint
    ): Promise<ReturnType<typeof waitForTransactionReceipt>> => {
      await refetchAllowance()

      if ((allowance as bigint) < amount) {
        return await approveSrcAsset([offerAddress, amount], {
          pendingTitle: 'Approving contract to use your tokens',
          failTitle: 'Failed to finalize approval',
          successTitle: 'Contract has been approved to use your tokens'
        })
      }

      return await deposit([amount], {
        pendingTitle: 'Depositing',
        successTitle: 'Deposit succeeded',
        failTitle: 'Failed to deposit'
      })
    },
    [refetchAllowance, allowance, deposit, approveSrcAsset, offerAddress]
  )

  return {
    depositFund,
    isDepositing: approveStatus === 'pending' || depositStatus === 'pending'
  }
}

export default useDeposit

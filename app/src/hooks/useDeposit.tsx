import { useCallback } from 'react'
import { type Address } from 'abitype'
import type { waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Contract, offerContract } from '~/helpers/contracts'
import useContractWriteComplete from './useContractWriteComplete'

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
    async (amount: bigint) => {
      await refetchAllowance()

      if ((allowance as bigint) < amount) {
        return await approveSrcAsset([offerAddress, amount], {
          pendingTitle: 'Approving deposition',
          successTitle: 'Approve succeeded',
          failTitle: 'Failed to approve'
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

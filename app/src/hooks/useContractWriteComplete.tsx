import { useCallback, useState } from 'react'
import type { Abi, Address } from 'abitype'
import {
  writeContract,
  waitForTransactionReceipt,
  type WriteContractParameters
} from '@wagmi/core'
import { usePendingTransactions } from '~/providers/PendingTransactionsProvider.js'
import { config } from '~/helpers/config.js'
import useToast from '~/hooks/useToast.js'

export type ErrorHandler = (error: any) => void

type ContractWriteComplete = (data: {
  address: Address
  abi: Abi
  functionName: string
}) => {
  status: 'idle' | 'pending' | 'error' | 'success'
  writeAsync: (
    args: WriteContractParameters['args'],
    title?: {
      pendingTitle?: string
      successTitle?: string
      failTitle?: string
    },
    value?: bigint
  ) => Promise<ReturnType<typeof waitForTransactionReceipt>>
}

const useContractWriteComplete: ContractWriteComplete = (data) => {
  const { initiateNewTx, completeTx } = usePendingTransactions()

  const [status, setStatus] =
    useState<ReturnType<ContractWriteComplete>['status']>('idle')

  const { toastSuccess, toastError } = useToast()

  const writeAsync: ReturnType<ContractWriteComplete>['writeAsync'] =
    useCallback(
      async (
        args,
        title,
        value
      ): Promise<ReturnType<typeof waitForTransactionReceipt>> => {
        let hash

        try {
          setStatus('pending')

          hash = await writeContract(config, {
            ...data,
            args,
            value
            // type: 'legacy'
          })

          title?.pendingTitle &&
            initiateNewTx({
              hash,
              title: title.pendingTitle
            })

          const receipt = await waitForTransactionReceipt(config, { hash })

          completeTx({ hash })
          setStatus('success')
          title?.successTitle &&
            toastSuccess({
              title: title.successTitle,
              txHash: hash
            })

          return receipt
        } catch (e: any) {
          setStatus('error')
          title?.failTitle &&
            toastError({
              title: title.failTitle,
              description: e.details,
              txHash: hash
            })
          throw e
        }
      },
      [data, initiateNewTx, completeTx, toastSuccess, toastError]
    )

  return {
    writeAsync,
    status
  }
}

export default useContractWriteComplete

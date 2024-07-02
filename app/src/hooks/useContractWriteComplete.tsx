import { useCallback, useRef } from 'react'
import { type WriteContractResult } from '@wagmi/core'
import { type TransactionReceipt } from 'viem'
import { useContractWrite, useWaitForTransaction } from 'wagmi'
import { usePendingTransactions } from '~/providers/PendingTransactionsProvider'

type ContractWriteOptions = Parameters<typeof useContractWrite>[0]

type WaitForTransactionOptions = Parameters<typeof useWaitForTransaction>[0]

export type SuccessHandler = (data: TransactionReceipt) => void

export type SettledHandler = (data: TransactionReceipt | undefined, error: any | null) => void

export type ErrorHandler = (error: any) => void

export interface UseContractWriteComplete {
  isLoading: boolean
  write?: (args?: any) => any
  writeAsync: (args: any) => Promise<any>
  [x: string | number | symbol]: unknown
}

const useContractWriteComplete = ({
  description,
  onSuccess,
  onError,
  onSettled,
  ...options
}: Omit<ContractWriteOptions, 'onSuccess' | 'onError' | 'onSettled'> & {
  description: string
  onSuccess?: SuccessHandler
  onSettled?: SettledHandler
  onError?: ErrorHandler
}): UseContractWriteComplete => {
  const resolveRef = useRef<(value: WriteContractResult) => void>()

  const { initiateNewTx, completeTx } = usePendingTransactions()

  const {
    data,
    writeAsync: writeTxAsync,
    ...other
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  } = useContractWrite({
    ...options,
    onSuccess: (data) => {
      initiateNewTx({
        hash: data.hash,
        title: description
      })
    },
    onSettled
  } as ContractWriteOptions)

  const waitResult = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: (arg) => {
      completeTx({ hash: arg.transactionHash })
      onSuccess?.(arg)
      resolveRef.current?.({ hash: arg.transactionHash })
    },
    onError,
    onSettled
  } satisfies WaitForTransactionOptions)

  const writeAsync: ReturnType<typeof useContractWrite>['writeAsync'] = useCallback(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    async (config) => {
      (writeTxAsync as (args: any) => any)?.(config).catch(console.error)
      return await new Promise<WriteContractResult>((resolve) => (resolveRef.current = resolve))
    },
    [writeTxAsync]
  )

  return {
    ...waitResult,
    ...other,
    writeAsync,
    isLoading: waitResult.isLoading || other.isLoading
  }
}

export default useContractWriteComplete

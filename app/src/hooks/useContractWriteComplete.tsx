import { useCallback, useRef } from 'react';
import { WriteContractResult } from '@wagmi/core';
import { TransactionReceipt } from 'viem';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { usePendingTransactions } from '~/providers/PendingTransactionsProvider';

type ContractWriteOptions = Parameters<typeof useContractWrite>[0];

type WaitForTransactionOptions = Parameters<typeof useWaitForTransaction>[0];

const useContractWriteComplete = ({
  description,
  onSuccess,
  onError,
  onSettled,
  ...options
}: Omit<ContractWriteOptions, 'onSuccess' | 'onError' | 'onSettled'> & {
  description: string;
  onSuccess?: (data: TransactionReceipt) => void;
  onError?: (error: Record<string, string>) => void;
  onSettled?: (data: TransactionReceipt | undefined, error: Record<string, string> | null) => void;
}) => {
  const resolveRef = useRef<(value: WriteContractResult) => void>();

  const { initiateNewTx, completeTx } = usePendingTransactions();

  const {
    data,
    writeAsync: writeTxAsync,
    ...other
  } = useContractWrite({
    ...options,
    onSuccess: (data) =>
      initiateNewTx({
        hash: data.hash,
        title: description,
      }),
    onSettled,
  } as ContractWriteOptions);

  const waitResult = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: (arg) => {
      completeTx({
        hash: arg.transactionHash,
      });
      onSuccess?.(arg);
      resolveRef.current?.({ hash: arg.transactionHash });
    },
    onError,
    onSettled,
  } as WaitForTransactionOptions);

  const writeAsync: ReturnType<typeof useContractWrite>['writeAsync'] = useCallback(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (config) => {
      writeTxAsync?.(config);
      return new Promise<WriteContractResult>((resolve) => (resolveRef.current = resolve));
    },
    [writeTxAsync],
  );

  return {
    ...waitResult,
    ...other,
    writeAsync,
    isLoading: waitResult.isLoading || other.isLoading,
  };
};

export default useContractWriteComplete;

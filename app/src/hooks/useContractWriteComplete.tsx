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
  const { initiateNewTx, completeTx } = usePendingTransactions();

  const { data, ...other } = useContractWrite({
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
    },
    onError,
    onSettled,
  } as WaitForTransactionOptions);

  return {
    ...waitResult,
    ...other,
    isLoading: waitResult.isLoading || other.isLoading,
  };
};

export default useContractWriteComplete;

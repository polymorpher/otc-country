import { useContractWrite, useWaitForTransaction } from 'wagmi';

type ContractWriteOptions = Parameters<typeof useContractWrite>[0];

type WaitForTransactionOptions = Parameters<typeof useWaitForTransaction>[0];

const useContractWriteComplete = ({ onSuccess, onError, onMutate, onSettled, ...options }: ContractWriteOptions) => {
  const { data, ...other } = useContractWrite(options as ContractWriteOptions);

  const waitResult = useWaitForTransaction({
    hash: data?.hash,
    onSuccess,
    onError,
    onMutate,
    onSettled,
  } as WaitForTransactionOptions);

  return {
    ...waitResult,
    ...other,
    isLoading: waitResult.isLoading || other.isLoading,
  };
};

export default useContractWriteComplete;

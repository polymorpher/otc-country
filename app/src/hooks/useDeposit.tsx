import { useCallback } from 'react';
import { Address } from 'abitype';
import { useAccount, useContractRead } from 'wagmi';
import { erc20Contract, offerContract } from '~/helpers/contracts';
import useContractWriteComplete, { SettledHandler, SuccessHandler } from './useContractWriteComplete';

interface Config {
  offerAddress: Address;
  srcAsset: Address;
  onSettled: SettledHandler;
  onSuccess: SuccessHandler;
}

const useDeposit = ({ offerAddress, srcAsset, onSuccess, onSettled }: Config) => {
  const { address } = useAccount();

  const { writeAsync: approveSrcAsset, isLoading: isApproving } = useContractWriteComplete({
    ...erc20Contract(srcAsset),
    functionName: 'approve',
    description: 'Approving deposition',
    onSettled,
  });

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'allowance',
    args: [address, offerAddress],
  });

  const { write, isLoading: isDepositing } = useContractWriteComplete({
    ...offerContract(offerAddress),
    functionName: 'deposit',
    description: 'Depositing',
    onSuccess,
  });

  const depositFund = useCallback(
    async (amount: bigint) => {
      await refetchAllowance();

      if ((allowance as bigint) < amount) {
        await approveSrcAsset?.({
          args: [offerAddress, amount],
        });
      }

      return write?.({
        args: [amount],
      });
    },
    [allowance, approveSrcAsset, write, offerAddress, refetchAllowance],
  );

  return {
    depositFund,
    isDepositing: isApproving || isDepositing,
  };
};

export default useDeposit;

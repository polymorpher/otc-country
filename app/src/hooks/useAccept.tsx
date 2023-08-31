import { useCallback } from 'react';
import { Address } from 'abitype';
import { useAccount, useContractRead } from 'wagmi';
import { erc20Contract, offerContract } from '~/helpers/contracts';
import useContractWriteComplete, { SettledHandler, SuccessHandler } from './useContractWriteComplete';

interface Config {
  offerAddress: Address;
  destAsset: Address;
  acceptAmount: bigint;
  onSuccess: SuccessHandler;
  onSettled: SettledHandler;
}

const useAccept = ({ offerAddress, destAsset, acceptAmount, onSuccess, onSettled }: Config) => {
  const { address: userAddress } = useAccount();

  const { data: destBalance } = useContractRead({
    ...erc20Contract(destAsset),
    functionName: 'balanceOf',
    args: [userAddress],
  });

  const { data: allowance } = useContractRead({
    ...erc20Contract(destAsset),
    functionName: 'allowance',
    args: [userAddress, offerAddress],
  });

  const { writeAsync: acceptOffer, isLoading: isAccepting } = useContractWriteComplete({
    ...offerContract(offerAddress),
    functionName: 'accept',
    description: 'Accepting offer',
    onSuccess,
    onSettled,
  });

  const { writeAsync: approveDestAsset, isLoading: isApproving } = useContractWriteComplete({
    ...erc20Contract(destAsset),
    functionName: 'approve',
    description: 'Approving accept',
    onSettled,
  });

  const onAccept = useCallback(async () => {
    if (allowance < acceptAmount) {
      await approveDestAsset?.({
        args: [offerAddress, acceptAmount],
      });
    }

    await acceptOffer?.({ args: [userAddress] });
  }, [acceptAmount, acceptOffer, allowance, approveDestAsset, offerAddress, userAddress]);

  return {
    destBalance,
    acceptAmount,
    isLoading: isAccepting || isApproving,
    onAccept,
  };
};

export default useAccept;

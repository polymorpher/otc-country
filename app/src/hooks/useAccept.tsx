import { useCallback } from 'react';
import { Address } from 'abitype';
import { TransactionReceipt } from 'viem';
import { useContractReads } from 'wagmi';
import { erc20Contract, offerContract } from '~/helpers/contracts';
import useContractWriteComplete from './useContractWriteComplete';

interface Config {
  offerAddress: Address;
  destAsset: Address;
  userAddress: Address;
  onSuccess: (data: TransactionReceipt) => void;
}

const useAccept = ({ userAddress, offerAddress, destAsset, onSuccess }: Config) => {
  const { data: destAssetInfo } = useContractReads({
    contracts: [
      {
        ...erc20Contract(destAsset),
        functionName: 'balanceOf',
        args: [userAddress],
      },
      {
        ...offerContract(offerAddress),
        functionName: 'acceptAmount',
      },
      {
        ...erc20Contract(destAsset),
        functionName: 'allowance',
        args: [userAddress, offerAddress],
      },
    ],
  });

  const destBalance = destAssetInfo?.[0].result as bigint;
  const acceptAmount = destAssetInfo?.[1].result as bigint;
  const allowance = destAssetInfo?.[2].result as bigint;

  const { writeAsync: acceptOffer, isLoading: isAccepting } = useContractWriteComplete({
    ...offerContract(offerAddress),
    functionName: 'accept',
    description: 'Accepting offer',
    onSuccess,
  });

  const { writeAsync: approveDestAsset, isLoading: isApproving } = useContractWriteComplete({
    ...offerContract(offerAddress),
    functionName: 'approve',
    description: 'Allowing the offer to handle destination asset',
  });

  const onAccept = useCallback(async () => {
    if (allowance < acceptAmount) {
      await approveDestAsset?.({
        args: [userAddress, offerAddress],
      });
    }

    await acceptOffer?.();
  }, [acceptAmount, acceptOffer, allowance, approveDestAsset, offerAddress, userAddress]);

  return {
    destBalance,
    acceptAmount,
    isLoading: isAccepting || isApproving,
    onAccept,
  };
};

export default useAccept;

import { useCallback } from 'react';
import { Address } from 'abitype';
import { TransactionReceipt } from 'viem';
import { useAccount, useContractReads } from 'wagmi';
import { erc20Contract, offerContract } from '~/helpers/contracts';
import useContractWriteComplete from './useContractWriteComplete';

interface Config {
  offerAddress: Address;
  destAsset: Address;
  acceptAmount: bigint;
  onSuccess: (data: TransactionReceipt) => void;
}

const useAccept = ({ offerAddress, destAsset, acceptAmount, onSuccess }: Config) => {
  const { address: userAddress } = useAccount();

  const { data: destAssetInfo } = useContractReads({
    contracts: [
      {
        ...erc20Contract(destAsset),
        functionName: 'balanceOf',
        args: [userAddress],
      },
      {
        ...erc20Contract(destAsset),
        functionName: 'allowance',
        args: [userAddress, offerAddress],
      },
    ],
  });

  const destBalance = destAssetInfo?.[0].result as bigint;
  const allowance = destAssetInfo?.[1].result as bigint;

  const { writeAsync: acceptOffer, isLoading: isAccepting } = useContractWriteComplete({
    ...offerContract(offerAddress),
    functionName: 'accept',
    description: 'Accepting offer',
    onSuccess,
  });

  const { writeAsync: approveDestAsset, isLoading: isApproving } = useContractWriteComplete({
    ...erc20Contract(destAsset),
    functionName: 'approve',
    description: 'Allowing the offer to handle destination asset',
  });

  const onAccept = useCallback(async () => {
    if (allowance < acceptAmount) {
      await approveDestAsset?.({
        args: [offerAddress, acceptAmount],
      });
    }

    await acceptOffer?.();
  }, [acceptAmount, acceptOffer, allowance, approveDestAsset, offerAddress]);

  return {
    destBalance,
    acceptAmount,
    isLoading: isAccepting || isApproving,
    onAccept,
  };
};

export default useAccept;

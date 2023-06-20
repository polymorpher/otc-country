import { useCallback } from 'react';
import { Address } from 'abitype';
import { keccak256, toHex } from 'viem';
import { useBalance, useContractRead } from 'wagmi';
import { domainContract, erc20Contract, otcContract } from '~/helpers/contracts';
import useContractWriteComplete from './useContractWriteComplete';

interface Config {
  address: Address;
  srcAsset: Address;
  chainId: number;
  domain: string;
}

interface OfferData {
  domainOwner: Address;
  srcAsset: Address;
  destAsset: Address;
  depositAmount: bigint;
  acceptAmount: bigint;
  commissionRate: bigint;
  lockWithdrawDuration: bigint;
}

const useNewOffer = ({ address, srcAsset, domain, chainId }: Config) => {
  const { data: balance } = useBalance({
    address,
    chainId,
  });

  const { data: domainContractAddress } = useContractRead({
    ...otcContract,
    functionName: 'domainContract',
  });

  const { data: domainPrice, isRefetching: isRefetchingDomainPrice } = useContractRead({
    ...domainContract(domainContractAddress as Address),
    functionName: 'getPrice',
    args: [domain],
  });

  const { data: srcBalance } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: computedOfferAddress } = useContractRead({
    ...otcContract,
    functionName: 'computedOfferAddress',
    args: [domain],
  });

  const { data: allowance } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'allowance',
    args: [address, computedOfferAddress],
  });

  const { data: srcDecimals } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'decimals',
  });

  const { writeAsync: approveSrcAsset, isLoading: isApproving } = useContractWriteComplete({
    ...erc20Contract(srcAsset),
    functionName: 'approve',
    description: 'Allowing deposition of source asset',
  });

  const { writeAsync: createOfferAsync, isLoading: isCreatingOffer } = useContractWriteComplete({
    ...otcContract,
    functionName: 'createOffer',
    description: 'Creating offer',
  });

  const createOffer = useCallback(
    async ({
      domainOwner,
      srcAsset,
      destAsset,
      depositAmount,
      acceptAmount,
      commissionRate,
      lockWithdrawDuration,
    }: OfferData) => {
      if ((allowance as bigint) < depositAmount) {
        await approveSrcAsset?.({
          args: [computedOfferAddress, depositAmount],
        });
      }

      return createOfferAsync?.({
        args: [
          domain,
          keccak256(toHex(Math.random().toString())),
          domainOwner,
          srcAsset,
          destAsset,
          depositAmount,
          acceptAmount,
          commissionRate,
          lockWithdrawDuration,
        ],
        value: domainPrice as bigint,
      });
    },
    [allowance, approveSrcAsset, computedOfferAddress, createOfferAsync, domain, domainPrice],
  );

  return {
    balance: balance?.value as bigint,
    srcBalance: srcBalance as bigint,
    srcDecimals: srcDecimals as bigint,
    domainPrice: domainPrice as bigint,
    isRefetchingDomainPrice,
    isCreatingOffer: isApproving || isCreatingOffer,
    createOffer,
  };
};

export default useNewOffer;

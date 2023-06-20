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
  onCreate: VoidFunction;
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

const useNewOffer = ({ address, srcAsset, domain, chainId, onCreate }: Config) => {
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

  const { data: srcDecimals } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'decimals',
  });

  const { writeAsync: createOfferAsync, isLoading: isCreatingOffer } = useContractWriteComplete({
    ...otcContract,
    functionName: 'createOffer',
    description: 'Creating offer',
    onSuccess: onCreate,
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
    }: OfferData) =>
      createOfferAsync?.({
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
      }),
    [createOfferAsync, domain, domainPrice],
  );

  return {
    balance: balance?.value as bigint,
    srcBalance: srcBalance as bigint,
    srcDecimals: srcDecimals as bigint,
    domainPrice: domainPrice as bigint,
    isRefetchingDomainPrice,
    isCreatingOffer,
    createOffer,
  };
};

export default useNewOffer;

import { Address } from 'abitype';
import { useContractRead, useContractReads } from 'wagmi';
import { erc20Contract, offerContract, otcContract } from '~/helpers/contracts';
import { Status } from '~/helpers/types';

interface Config {
  address: Address;
}

const useOffer = ({ address }: Config) => {
  const {
    data: status,
    refetch: refetchStatus,
    isLoading: isStatusLoading,
  } = useContractRead({
    ...offerContract(address),
    functionName: 'status',
  });

  const {
    data: totalDeposits,
    refetch: refetchTotalDeposits,
    isLoading: isTotalDepositsLoading,
  } = useContractRead({
    ...offerContract(address),
    functionName: 'totalDeposits',
  });

  const {
    data: info,
    error,
    isLoading: isInfoLoading,
  } = useContractReads({
    contracts: [
      {
        ...offerContract(address),
        functionName: 'creator',
      },
      {
        ...offerContract(address),
        functionName: 'domainOwner',
      },
      {
        ...offerContract(address),
        functionName: 'commissionRate',
      },
      {
        ...offerContract(address),
        functionName: 'acceptAmount',
      },
      {
        ...offerContract(address),
        functionName: 'srcAsset',
      },
      {
        ...offerContract(address),
        functionName: 'destAsset',
      },

      {
        ...otcContract,
        functionName: 'commissionRateScale',
      },
    ],
  });

  const { result: creator } = info?.[0] ?? {};
  const { result: domainOwner } = info?.[1] ?? {};
  const { result: commissionRate } = info?.[2] ?? {};
  const { result: acceptAmount } = info?.[3] ?? {};
  const { result: srcAsset } = info?.[4] ?? {};
  const { result: destAsset } = info?.[5] ?? {};
  const { result: commissionRateScale } = info?.[6] ?? {};

  const { data: srcDecimals } = useContractRead({
    ...erc20Contract(srcAsset as Address),
    functionName: 'decimals',
  });

  const { data: destDecimals } = useContractRead({
    ...erc20Contract(destAsset as Address),
    functionName: 'decimals',
  });

  return {
    data: {
      creator: creator as Address | undefined,
      domainOwner: domainOwner as Address | undefined,
      commissionRate: commissionRate as bigint | undefined,
      acceptAmount: acceptAmount as bigint | undefined,
      srcAsset: srcAsset as Address | undefined,
      destAsset: destAsset as Address | undefined,
      commissionRateScale: commissionRateScale as bigint | undefined,
      srcDecimals: srcDecimals === undefined ? undefined : Number(srcDecimals),
      destDecimals: destDecimals === undefined ? undefined : Number(destDecimals),
      totalDeposits: totalDeposits as bigint | undefined,
      status: status as Status | undefined,
    },
    refetch: {
      refetchStatus,
      refetchTotalDeposits,
    },
    isLoading: {
      isStatusLoading: isStatusLoading || status === undefined,
      isTotalDepositsLoading: isTotalDepositsLoading || totalDeposits === undefined,
      isLoading:
        isInfoLoading ||
        info === undefined ||
        isStatusLoading ||
        status === undefined ||
        isTotalDepositsLoading ||
        totalDeposits === undefined,
    },
    error,
  };
};

export default useOffer;

import { useState } from 'react';
import { Address } from 'abitype';
import { useContractRead, useContractReads } from 'wagmi';
import { erc20Contract, offerContract, otcContract } from '~/helpers/contracts';
import { Status } from '~/helpers/types';

interface Config {
  address: Address;
}

const useOffer = ({ address }: Config) => {
  const [status, setStatus] = useState<Status>();

  const [totalDeposits, setTotalDeppsits] = useState<bigint>();

  useContractRead({
    ...offerContract(address),
    functionName: 'status',
    onSuccess: setStatus,
  });

  const {
    data: info,
    error,
    isLoading: isInfoLoading,
  } = useContractReads({
    contracts: [
      {
        ...offerContract(address),
        functionName: 'totalDeposits',
      },
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
    onSuccess: ([totalDeposits]) => setTotalDeppsits(totalDeposits.result as bigint),
  });

  const { result: creator } = info?.[1] ?? {};
  const { result: domainOwner } = info?.[2] ?? {};
  const { result: commissionRate } = info?.[3] ?? {};
  const { result: acceptAmount } = info?.[4] ?? {};
  const { result: srcAsset } = info?.[5] ?? {};
  const { result: destAsset } = info?.[6] ?? {};
  const { result: commissionRateScale } = info?.[7] ?? {};

  const { data: srcDecimals } = useContractRead({
    ...erc20Contract(srcAsset as Address),
    functionName: 'decimals',
    enabled: false,
  });

  const { data: destDecimals } = useContractRead({
    ...erc20Contract(destAsset as Address),
    functionName: 'decimals',
    enabled: false,
  });

  return {
    creator,
    domainOwner,
    commissionRate,
    acceptAmount,
    srcAsset,
    destAsset,
    commissionRateScale,
    srcDecimals,
    destDecimals,
    totalDeposits,
    status,
    setStatus,
    setTotalDeppsits,
    error,
    isLoading: isInfoLoading || info === undefined || totalDeposits === undefined || status === undefined,
  };
};

export default useOffer;

import { Address } from 'abitype';
import { useAccount, useContractRead, useContractReads } from 'wagmi';
import { erc20Contract, offerContract, otcContract } from '~/helpers/contracts';
import { Status } from '~/helpers/types';

interface Config {
  address: Address;
}

const useOffer = ({ address }: Config) => {
  const { address: walletAddr } = useAccount();

  const {
    data: info,
    error,
    isLoading: isLoadingInfo,
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

  const {
    data: status,
    refetch: refetchStatus,
    isLoading: isLoadingStatus,
  } = useContractRead({
    ...offerContract(address),
    functionName: 'status',
  });

  const {
    data: totalDeposits,
    refetch: refetchTotalDeposits,
    isLoading: isLoadingTotalDeposits,
  } = useContractRead({
    ...offerContract(address),
    functionName: 'totalDeposits',
  });

  const {
    data: paymentBalanceForDomainOwner,
    refetch: refetchPaymentBalanceForDomainOwner,
    isLoading: isLoadingPaymentBalanceForDomainOwner,
  } = useContractRead({
    ...offerContract(address),
    functionName: 'paymentBalanceForDomainOwner',
  });

  const {
    data: paymentBalanceForDepositor,
    refetch: refetchPaymentBalanceForDepositor,
    isLoading: isLoadingPaymentBalanceForDepositor,
  } = useContractRead({ ...offerContract(address), functionName: 'paymentBalanceForDepositor', args: [walletAddr] });

  const {
    data: deposits,
    refetch: refetchDeposits,
    isLoading: isLoadingDeposits,
  } = useContractRead({ ...offerContract(address), functionName: 'deposits', args: [walletAddr] });

  const {
    data: lockWithdrawUntil,
    refetch: refetchLockWithdrawUntil,
    isLoading: isLoadingLockWithdrawUntil,
  } = useContractRead({ ...offerContract(address), functionName: 'lockWithdrawUntil', args: [walletAddr] });

  const {
    data: balanceOf,
    refetch: refetchBalanceOf,
    isLoading: isLoadingBalanceOf,
  } = useContractRead({ ...erc20Contract(srcAsset), functionName: 'balanceOf', args: [walletAddr] });

  return {
    data: {
      creator: creator as Address,
      domainOwner: domainOwner as Address,
      acceptAmount: acceptAmount as bigint,
      srcAsset: srcAsset as Address,
      destAsset: destAsset as Address,
      commissionRate: Number(commissionRate),
      commissionRateScale: Number(commissionRateScale),
      lockWithdrawUntil: Number(lockWithdrawUntil),
      totalDeposits: totalDeposits as bigint,
      status: status as Status,
      paymentBalanceForDepositor: paymentBalanceForDepositor as bigint,
      paymentBalanceForDomainOwner: paymentBalanceForDomainOwner as bigint,
      deposits: deposits as bigint,
      balanceOf: balanceOf as bigint,
    },
    refetch: {
      refetchStatus,
      refetchTotalDeposits,
      refetchPaymentBalanceForDomainOwner,
      refetchPaymentBalanceForDepositor,
      refetchDeposits,
      refetchLockWithdrawUntil,
      refetchBalanceOf,
    },
    isLoading: {
      isLoadingStatus: isLoadingStatus || status === undefined,
      isLoadingTotalDeposits: isLoadingTotalDeposits || totalDeposits === undefined,
      isLoadingDeposits: isLoadingDeposits || deposits === undefined,
      isLoadingLockWithdrawUntil: isLoadingLockWithdrawUntil || lockWithdrawUntil === undefined,
      isLoading: isLoadingInfo || info === undefined || isLoadingStatus || status === undefined,
      isLoadingPaymentBalanceForDomainOwner:
        isLoadingPaymentBalanceForDomainOwner || paymentBalanceForDomainOwner === undefined,
      isLoadingPaymentBalanceForDepositor:
        isLoadingPaymentBalanceForDepositor || paymentBalanceForDepositor === undefined,
      isLoadingBalanceOf: isLoadingBalanceOf || balanceOf === undefined,
    },
    error,
  };
};

export default useOffer;

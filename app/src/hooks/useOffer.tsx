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
    isRefetching: isRefetchingStatus,
    isLoading: isLoadingStatus,
  } = useContractRead({
    ...offerContract(address),
    functionName: 'status',
  });

  const {
    data: totalDeposits,
    refetch: refetchTotalDeposits,
    isRefetching: isRefetchingTotalDeposits,
    isLoading: isLoadingTotalDeposits,
  } = useContractRead({
    ...offerContract(address),
    functionName: 'totalDeposits',
  });

  const {
    data: paymentBalanceForDomainOwner,
    refetch: refetchPaymentBalanceForDomainOwner,
    isRefetching: isRefetchingPaymentBalanceForDomainOwner,
    isLoading: isLoadingPaymentBalanceForDomainOwner,
  } = useContractRead({
    ...offerContract(address),
    functionName: 'paymentBalanceForDomainOwner',
  });

  const {
    data: paymentBalanceForDepositor,
    refetch: refetchPaymentBalanceForDepositor,
    isRefetching: isRefetchingPaymentBalanceForDepositor,
    isLoading: isLoadingPaymentBalanceForDepositor,
  } = useContractRead({ ...offerContract(address), functionName: 'paymentBalanceForDepositor', args: [walletAddr] });

  const {
    data: deposits,
    refetch: refetchDeposits,
    isRefetching: isRefetchingDeposits,
    isLoading: isLoadingDeposits,
  } = useContractRead({ ...offerContract(address), functionName: 'deposits', args: [walletAddr] });

  const {
    data: lockWithdrawUntil,
    refetch: refetchLockWithdrawUntil,
    isRefetching: isRefetchingLockWithdrawUntil,
    isLoading: isLoadingLockWithdrawUntil,
  } = useContractRead({ ...offerContract(address), functionName: 'lockWithdrawUntil', args: [walletAddr] });

  const {
    data: balanceOf,
    refetch: refetchBalanceOf,
    isRefetching: isRefetchingBalanceOf,
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
      isLoading: isLoadingInfo || isLoadingStatus,
      isLoadingStatus: isLoadingStatus || isRefetchingStatus,
      isLoadingTotalDeposits: isLoadingTotalDeposits || isRefetchingTotalDeposits,
      isLoadingDeposits: isLoadingDeposits || isRefetchingDeposits,
      isLoadingLockWithdrawUntil: isLoadingLockWithdrawUntil || isRefetchingLockWithdrawUntil,
      isLoadingPaymentBalanceForDomainOwner:
        isLoadingPaymentBalanceForDomainOwner || isRefetchingPaymentBalanceForDomainOwner,
      isLoadingPaymentBalanceForDepositor:
        isLoadingPaymentBalanceForDepositor || isRefetchingPaymentBalanceForDepositor,
      isLoadingBalanceOf: isLoadingBalanceOf || isRefetchingBalanceOf,
    },
    error,
  };
};

export default useOffer;

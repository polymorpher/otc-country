import { type Address } from 'abitype'
import { useAccount, useContractRead, useContractReads } from 'wagmi'
import { erc20Contract, offerContract, otcContract } from '~/helpers/contracts'
import { type Status } from '~/helpers/types'

interface Config {
  address: Address
}

export interface UseOfferType {
  data: {
    creator: Address
    domainOwner: Address
    acceptAmount: bigint
    srcAsset: Address
    destAsset: Address
    commissionRate: number
    commissionRateScale: number
    lockWithdrawUntil: number
    totalDeposits: bigint
    status: Status
    paymentBalanceForDepositor: bigint
    paymentBalanceForDomainOwner: bigint
    deposits: bigint
    balanceOf: bigint
  }
  refetch: {
    refetchStatus: any
    refetchTotalDeposits: any
    refetchPaymentBalanceForDomainOwner: any
    refetchPaymentBalanceForDepositor: any
    refetchDeposits: any
    refetchLockWithdrawUntil: any
    refetchBalanceOf: any
  }
  isLoading: {
    isLoading: boolean
    isLoadingStatus: boolean
    isLoadingTotalDeposits: boolean
    isLoadingDeposits: boolean
    isLoadingLockWithdrawUntil: boolean
    isLoadingPaymentBalanceForDomainOwner: boolean
    isLoadingPaymentBalanceForDepositor: boolean
    isLoadingBalanceOf: boolean
  }
  error: Error | any | null
}

const useOffer = ({ address }: Config): UseOfferType => {
  const { address: walletAddr } = useAccount()

  const {
    data: info,
    error,
    isLoading: isLoadingInfo
  } = useContractReads({
    contracts: [
      {
        ...offerContract(address),
        functionName: 'creator'
      },
      {
        ...offerContract(address),
        functionName: 'domainOwner'
      },
      {
        ...offerContract(address),
        functionName: 'commissionRate'
      },
      {
        ...offerContract(address),
        functionName: 'acceptAmount'
      },
      {
        ...offerContract(address),
        functionName: 'srcAsset'
      },
      {
        ...offerContract(address),
        functionName: 'destAsset'
      },

      {
        ...otcContract,
        functionName: 'commissionRateScale'
      }
    ]
  })

  const { result: creator } = info?.[0] ?? {}
  const { result: domainOwner } = info?.[1] ?? {}
  const { result: commissionRate } = info?.[2] ?? {}
  const { result: acceptAmount } = info?.[3] ?? {}
  const { result: srcAsset } = info?.[4] ?? {}
  const { result: destAsset } = info?.[5] ?? {}
  const { result: commissionRateScale } = info?.[6] ?? {}

  const {
    data: status,
    refetch: refetchStatus,
    isFetching: isFetchingStatus,
    isLoading: isLoadingStatus
  } = useContractRead({
    ...offerContract(address),
    functionName: 'status'
  })

  const {
    data: totalDeposits,
    refetch: refetchTotalDeposits,
    isFetching: isFetchingTotalDeposits,
    isLoading: isLoadingTotalDeposits
  } = useContractRead({
    ...offerContract(address),
    functionName: 'totalDeposits'
  })

  const {
    data: paymentBalanceForDomainOwner,
    refetch: refetchPaymentBalanceForDomainOwner,
    isFetching: isFetchingPaymentBalanceForDomainOwner,
    isLoading: isLoadingPaymentBalanceForDomainOwner
  } = useContractRead({
    ...offerContract(address),
    functionName: 'paymentBalanceForDomainOwner'
  })

  const {
    data: paymentBalanceForDepositor,
    refetch: refetchPaymentBalanceForDepositor,
    isFetching: isFetchingPaymentBalanceForDepositor,
    isLoading: isLoadingPaymentBalanceForDepositor
  } = useContractRead({ ...offerContract(address), functionName: 'paymentBalanceForDepositor', args: [walletAddr] })

  const {
    data: deposits,
    refetch: refetchDeposits,
    isFetching: isFetchingDeposits,
    isLoading: isLoadingDeposits
  } = useContractRead({ ...offerContract(address), functionName: 'deposits', args: [walletAddr] })

  const {
    data: lockWithdrawUntil,
    refetch: refetchLockWithdrawUntil,
    isFetching: isFetchingLockWithdrawUntil,
    isLoading: isLoadingLockWithdrawUntil
  } = useContractRead({ ...offerContract(address), functionName: 'lockWithdrawUntil', args: [walletAddr] })

  const {
    data: balanceOf,
    refetch: refetchBalanceOf,
    isFetching: isFetchingBalanceOf,
    isLoading: isLoadingBalanceOf
  } = useContractRead({ ...erc20Contract(srcAsset as Address), functionName: 'balanceOf', args: [walletAddr] })

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
      balanceOf: balanceOf as bigint
    },
    refetch: {
      refetchStatus,
      refetchTotalDeposits,
      refetchPaymentBalanceForDomainOwner,
      refetchPaymentBalanceForDepositor,
      refetchDeposits,
      refetchLockWithdrawUntil,
      refetchBalanceOf
    },
    isLoading: {
      isLoading: isLoadingInfo || isLoadingStatus,
      isLoadingStatus: isLoadingStatus || isFetchingStatus,
      isLoadingTotalDeposits: isLoadingTotalDeposits || isFetchingTotalDeposits,
      isLoadingDeposits: isLoadingDeposits || isFetchingDeposits,
      isLoadingLockWithdrawUntil: isLoadingLockWithdrawUntil || isFetchingLockWithdrawUntil,
      isLoadingPaymentBalanceForDomainOwner:
        isLoadingPaymentBalanceForDomainOwner || isFetchingPaymentBalanceForDomainOwner,
      isLoadingPaymentBalanceForDepositor: isLoadingPaymentBalanceForDepositor || isFetchingPaymentBalanceForDepositor,
      isLoadingBalanceOf: isLoadingBalanceOf || isFetchingBalanceOf
    },
    error
  }
}

export default useOffer

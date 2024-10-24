import React, { useCallback } from 'react'
import { Alert, AlertIcon, Box, Button, Spinner, Text, VStack } from '@chakra-ui/react'
import { type Address } from 'abitype'
import { formatUnits } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import AddressField from '~/components/AddressField'
import AmountPopover from '~/components/AmountPopover'
import ClaimPayment from '~/components/ClaimPayment'
import OfferStatus from '~/components/OfferStatus'
import Withdraw from '~/components/Withdraw'
import { erc20Contract, offerContract } from '~/helpers/contracts'
import { round } from '~/helpers/mantisa'
import { Status } from '~/helpers/types'
import useAccept from '~/hooks/useAccept'
import useBlockTimestamp from '~/hooks/useBlockTimestamp'
import useContractWriteComplete from '~/hooks/useContractWriteComplete'
import useDeposit from '~/hooks/useDeposit'
import useOffer from '~/hooks/useOffer'

interface OfferProps {
  address: Address
}

const Offer: React.FC<OfferProps> = ({ address }) => {
  const { address: walletAddr } = useAccount()

  const {
    data: {
      creator,
      domainOwner,
      commissionRate,
      acceptAmount,
      srcAsset,
      destAsset,
      commissionRateScale,
      totalDeposits,
      status,
      deposits,
      lockWithdrawUntil,
      paymentBalanceForDepositor,
      paymentBalanceForDomainOwner
    },
    isLoading: {
      isLoading,
      isLoadingDeposits,
      isLoadingTotalDeposits,
      isLoadingStatus,
      isLoadingBalanceOf,
      isLoadingLockWithdrawUntil,
      isLoadingPaymentBalanceForDepositor,
      isLoadingPaymentBalanceForDomainOwner
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
    error
  } = useOffer({ address })

  const timestamp = useBlockTimestamp()

  const { data: srcDecimals } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'decimals'
  })

  const { data: srcBalance } = useReadContract({
    ...erc20Contract(srcAsset),
    functionName: 'balanceOf',
    args: [walletAddr]
  })

  const { data: destDecimals } = useReadContract({
    ...erc20Contract(destAsset),
    functionName: 'decimals'
  })

  const { writeAsync: closeOffer, status: closeStatus } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'close'
  })

  const {
    destBalance,
    isLoading: isAccepting,
    onAccept
  } = useAccept({
    offerAddress: address,
    acceptAmount,
    destAsset
  })

  const refetch = useCallback(() => {
    refetchTotalDeposits()
    refetchPaymentBalanceForDomainOwner()
    refetchPaymentBalanceForDepositor()
    refetchDeposits()
    refetchLockWithdrawUntil()
    refetchBalanceOf()
  }, [
    refetchBalanceOf,
    refetchDeposits,
    refetchLockWithdrawUntil,
    refetchPaymentBalanceForDepositor,
    refetchPaymentBalanceForDomainOwner,
    refetchTotalDeposits
  ])

  const { depositFund, isDepositing } = useDeposit({ offerAddress: address, srcAsset })

  const { writeAsync: withdraw, status: withdrawStatus } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'withdraw'
  })

  const { writeAsync: claimDepositorPayment, status: claimDepositorPaymentStatus } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'withdrawPaymentForDepositor'
  })

  const { writeAsync: claimDomainOwnerPayment, status: claimDomainOwnerPaymentStatus } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'withdrawPaymentForDomainOwner'
  })

  const isUserActionDoing =
    isAccepting ||
    withdrawStatus === 'pending' ||
    isDepositing ||
    isLoadingBalanceOf ||
    isLoadingLockWithdrawUntil ||
    claimDepositorPaymentStatus === 'pending' ||
    claimDomainOwnerPaymentStatus === 'pending' ||
    isLoadingPaymentBalanceForDepositor ||
    isLoadingPaymentBalanceForDomainOwner

  if (!isLoading && status === undefined) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error while fetching offer data
        <br/>
        {address}
      </Alert>
    )
  }

  return (
    <VStack width="full">
      {!isLoadingStatus && <OfferStatus status={status} />}

      <Text fontSize="2xl" py="10">
        Offer information
      </Text>

      {isLoading && <Spinner />}

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.details}
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns="10em 1fr" gridRowGap="4" gridColumnGap="4">
        {!isLoading && (
          <>
            <Text textAlign="right">Contract address</Text>
            <AddressField>{address}</AddressField>

            <Text textAlign="right">Creator</Text>
            <AddressField text={creator === walletAddr ? 'You' : undefined}>{String(creator)}</AddressField>

            <Text textAlign="right">Domain owner</Text>
            <AddressField text={domainOwner === walletAddr ? 'You' : undefined}>{String(domainOwner)}</AddressField>

            <Text textAlign="right">Commission rate</Text>
            <Text>{(commissionRate * 100) / commissionRateScale}%</Text>

            <Text textAlign="right">Accept amount</Text>
            <Text>{round(formatUnits(acceptAmount, Number(destDecimals)))}</Text>

            <Text textAlign="right">Source asset</Text>
            <AddressField>{String(srcAsset)}</AddressField>

            <Text textAlign="right">Destination asset</Text>
            <AddressField>{String(destAsset)}</AddressField>
          </>
        )}

        <Text textAlign="right">Total deposits</Text>
        {isLoadingTotalDeposits ? <Spinner /> : <Text>{round(formatUnits(totalDeposits, Number(srcDecimals)))}</Text>}

        {walletAddr !== undefined && (
          <>
            <Text textAlign="right">Your deposit</Text>
            {isLoadingDeposits ? <Spinner /> : <Text>{round(formatUnits(deposits, Number(srcDecimals)))}</Text>}
          </>
        )}
      </Box>

      {!isLoading && walletAddr !== undefined && (
        <VStack width="full" pt="10">
          {status === Status.Open && deposits === 0n && (
            <Text my="5">You can deposit your funds or accept the offer</Text>
          )}
          {status !== Status.Accepted
            ? (
                deposits > 0 &&
            timestamp !== undefined &&
            !isLoadingLockWithdrawUntil && (
              <AmountPopover
                max={deposits}
                decimals={Number(destDecimals)}
                onOkay={(amount) =>
                  withdraw(
                    [amount, walletAddr],
                    {
                      pendingTitle: 'Withdrawing',
                      successTitle: 'Withdraw succeded',
                      failTitle: 'Failed to withdraw'
                    }
                  ).then(() => { refetch() })
                }
              >
                <Withdraw
                  lockWithdrawUntil={lockWithdrawUntil}
                  timestamp={timestamp}
                  disabled={isUserActionDoing}
                  isWithdrawing={withdrawStatus === 'pending'}
                />
              </AmountPopover>
                )
              )
            : walletAddr === domainOwner
              ? (
                <ClaimPayment
              balance={paymentBalanceForDomainOwner}
              decimals={Number(destDecimals)}
              onClick={() => claimDomainOwnerPayment(
                [walletAddr],
                {
                  pendingTitle: 'Claiming payment',
                  successTitle: 'Payment has been claimed',
                  failTitle: 'Failed to claim the payment'
                }
              ).then(() => { refetchPaymentBalanceForDomainOwner() })}
              isClaiming={claimDomainOwnerPaymentStatus === 'pending'}
              disabled={isUserActionDoing}
            />
                )
              : deposits > 0
                ? (
                  <ClaimPayment
              balance={paymentBalanceForDepositor}
              decimals={Number(destDecimals)}
              onClick={() => claimDepositorPayment(
                [walletAddr],
                {
                  pendingTitle: 'Claiming payment',
                  successTitle: 'Payment has been claimed',
                  failTitle: 'Failed to claim the payment'
                }
              ).then(() => { refetchPaymentBalanceForDepositor() })}
              isClaiming={claimDepositorPaymentStatus === 'pending'}
              disabled={isUserActionDoing}
            />
                  )
                : (
                  <Text>You have no deposits</Text>
                  )}

          {status === Status.Open && srcBalance !== undefined && (
            <>
              <AmountPopover
                max={srcBalance as bigint}
                decimals={Number(srcDecimals)}
                onOkay={value => depositFund(value).then(() => { refetch() })}
              >
                <Button isDisabled={isUserActionDoing} isLoading={isDepositing} loadingText="Deposit">
                  Deposit
                </Button>
              </AmountPopover>
              {deposits === 0n && (
                <>
                  {destBalance < acceptAmount && (
                    <Alert status="warning">
                      <AlertIcon />
                      Your balance of destination asset is
                      {round(formatUnits(destBalance, Number(destDecimals)))},
                      which is not sufficient to accept the offer.
                    </Alert>
                  )}
                  <Button
                    onClick={() => onAccept().then(() => refetchStatus())}
                    isDisabled={isUserActionDoing || destBalance < acceptAmount}
                    isLoading={isAccepting}
                    loadingText="Accept"
                    colorScheme="green"
                  >
                    Accept
                  </Button>
                </>
              )}
              {creator === walletAddr && (
                <Button
                  onClick={() => closeOffer(
                    [],
                    {
                      pendingTitle: 'Closing offer',
                      successTitle: 'Offer has been closed',
                      failTitle: 'Failed to close the offer'
                    }
                  ).then(() => refetchStatus())}
                  isDisabled={isUserActionDoing}
                  isLoading={closeStatus === 'pending'}
                  loadingText="Close"
                  colorScheme="red"
                >
                  Close
                </Button>
              )}
            </>
          )}
        </VStack>
      )}
    </VStack>
  )
}

export default Offer

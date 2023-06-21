import React, { useCallback } from 'react';
import { Alert, AlertIcon, Box, Button, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import AddressField from '~/components/AddressField';
import AmountPopover from '~/components/AmountPopover';
import ClaimPayment from '~/components/ClaimPayment';
import OfferStatus from '~/components/OfferStatus';
import RemoteField from '~/components/RemoteField';
import Withdraw from '~/components/Withdraw';
import { offerContract } from '~/helpers/contracts';
import { Status } from '~/helpers/types';
import useAccept from '~/hooks/useAccept';
import useBlockTimestamp from '~/hooks/useBlockTimestamp';
import useContractWriteComplete from '~/hooks/useContractWriteComplete';
import useOffer from '~/hooks/useOffer';
import useToast from '~/hooks/useToast';

interface OfferProps {
  address: Address;
}

const Offer: React.FC<OfferProps> = ({ address }) => {
  const { address: walletAddr } = useAccount();

  const {
    data: {
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
      deposits,
      lockWithdrawUntil,
      paymentBalanceForDepositor,
      paymentBalanceForDomainOwner,
    },
    isLoading: { isLoading, isLoadingDeposits, isLoadingTotalDeposits, isLoadingStatus },
    refetch: {
      refetchStatus,
      refetchTotalDeposits,
      refetchPaymentBalanceForDomainOwner,
      refetchPaymentBalanceForDepositor,
      refetchDeposits,
      refetchLockWithdrawUntil,
      refetchBalanceOf,
    },
    error,
  } = useOffer({ address });

  const timestamp = useBlockTimestamp();

  const { toastSuccess, toastError } = useToast();

  const { write: closeOffer, isLoading: isClosing } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'close',
    description: 'Closing offer',
    onSuccess: (data) => {
      refetchStatus(),
        toastSuccess({
          title: 'Offer has been closed',
          txHash: data.transactionHash,
        });
    },
  });

  const {
    destBalance,
    isLoading: isAccepting,
    onAccept,
  } = useAccept({
    offerAddress: address,
    acceptAmount,
    destAsset,
    onSuccess: (data) => {
      refetchStatus();
      toastSuccess({
        title: 'Offer has been accepted',
        txHash: data.transactionHash,
      });
    },
  });

  const refetch = useCallback(() => {
    refetchTotalDeposits();
    refetchPaymentBalanceForDomainOwner();
    refetchPaymentBalanceForDepositor();
    refetchDeposits();
    refetchLockWithdrawUntil();
    refetchBalanceOf();
  }, [
    refetchBalanceOf,
    refetchDeposits,
    refetchLockWithdrawUntil,
    refetchPaymentBalanceForDepositor,
    refetchPaymentBalanceForDomainOwner,
    refetchTotalDeposits,
  ]);

  const { write: depositFund, isLoading: isDepositing } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'deposit',
    description: 'Depositing',
    onSuccess: (data) => {
      refetch();
      toastSuccess({
        title: 'Deposit successful',
        txHash: data.transactionHash,
      });
    },
  });

  const { write: withdraw, isLoading: isWithdrawing } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'withdraw',
    description: 'Withdrawing',
    onSuccess: (data) => {
      refetch();
      toastSuccess({
        title: 'Withdraw successful',
        txHash: data.transactionHash,
      });
    },
  });

  const { write: claimDepositorPayment, isLoading: isClaimingDepositorPayment } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'withdrawPaymentForDepositor',
    description: 'Claiming payment',
    onSuccess: (data) => {
      refetchPaymentBalanceForDepositor();
      toastSuccess({ title: 'Payment has been claimed', txHash: data.transactionHash });
    },
    onError: (error) => toastError({ title: 'Failed to withdraw the payment', description: error.message }),
    args: [],
  });

  const { write: claimDomainOwnerPayment, isLoading: isClaimingDomainOwnerPayment } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'withdrawPaymentForDomainOwner',
    description: 'Claiming payment',
    onSuccess: (data) => {
      refetchPaymentBalanceForDomainOwner();
      toastSuccess({ title: 'Payment has been withdrawn', txHash: data.transactionHash });
    },
    onError: (error) => toastError({ title: 'Failed to withdraw the payment', description: error.message }),
    args: [],
  });

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
          {error.message}
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns="10em 1fr" gridRowGap="4" gridColumnGap="4">
        {!isLoading && (
          <>
            <Text textAlign="right">Creator</Text>
            <AddressField text={creator === walletAddr ? 'You' : undefined}>{String(creator)}</AddressField>

            <Text textAlign="right">Domain owner</Text>
            <AddressField>{String(domainOwner)}</AddressField>

            <Text textAlign="right">Commission rate</Text>
            <Text>{(Number(commissionRate) * 100) / Number(commissionRateScale)}%</Text>

            <Text textAlign="right">Accept amount</Text>
            <Text>{formatUnits(acceptAmount as bigint, Number(destDecimals))}</Text>

            <Text textAlign="right">Source asset</Text>
            <AddressField>{String(srcAsset)}</AddressField>

            <Text textAlign="right">Destination asset</Text>
            <AddressField>{String(destAsset)}</AddressField>
          </>
        )}

        <Text textAlign="right">Total deposits</Text>
        <RemoteField loading={isLoadingTotalDeposits}>
          <Text>{formatUnits(totalDeposits, Number(srcDecimals))}</Text>
        </RemoteField>

        {walletAddr !== undefined && (
          <>
            <Text textAlign="right">Deposit</Text>
            <RemoteField loading={isLoadingDeposits}>
              <Text>{formatUnits(deposits, Number(srcDecimals))}</Text>
            </RemoteField>
          </>
        )}
      </Box>

      {!isLoading && walletAddr !== undefined && (
        <VStack width="full">
          {deposits === 0n && <Text>You can deposit your funds or accept the offer</Text>}
          {status !== Status.Accepted ? (
            deposits > 0 &&
            !isLoadingLockWithdrawUntil && (
              <AmountPopover
                max={deposits}
                decimals={destDecimals}
                onOkay={(amount) =>
                  withdraw?.({
                    args: [amount, walletAddr],
                  })
                }
              >
                <Withdraw
                  lockWithdrawUntil={Number(lockWithdrawUntil)}
                  timestamp={timestamp}
                  disabled={working}
                  isWithdrawing={isWithdrawing}
                />
              </AmountPopover>
            )
          ) : walletAddr === domainOwner ? (
            <ClaimPayment
              balance={paymentBalanceForDomainOwner}
              decimals={destDecimals}
              onClick={() => claimDomainOwnerPayment?.({ args: [walletAddr] })}
              isClaiming={isClaimingDomainOwnerPayment}
              disabled={working}
            />
          ) : (
            <ClaimPayment
              balance={paymentBalanceForDepositor}
              decimals={destDecimals}
              onClick={() => claimDepositorPayment?.({ args: [walletAddr] })}
              isClaiming={isClaimingDepositorPayment}
              disabled={working}
            />
          )}

          {status === Status.Open && (
            <>
              <AmountPopover
                max={srcBalance}
                decimals={srcDecimals}
                onOkay={(amount) =>
                  depositFund?.({
                    args: [amount],
                  })
                }
              >
                <Button isDisabled={working} isLoading={isDepositing} loadingText="Deposit">
                  Deposit
                </Button>
              </AmountPopover>
              {deposit === 0n && (
                <>
                  {destBalance >= acceptAmount && (
                    <Alert status="warning">
                      <AlertIcon />
                      You have ${formatUnits(acceptAmount, Number(destDecimals))} of destination asset, which is not
                      sufficient to accept the offer.
                    </Alert>
                  )}
                  <Button
                    onClick={onAccept}
                    isDisabled={working || destBalance < acceptAmount}
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
                  onClick={() => closeOffer?.()}
                  isDisabled={working}
                  isLoading={isClosing}
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
  );
};

export default Offer;

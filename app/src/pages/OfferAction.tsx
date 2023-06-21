import React, { useEffect, useState } from 'react';
import { Alert, AlertIcon, Button, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { formatUnits } from 'viem';
import { useAccount, useContractReads, usePublicClient } from 'wagmi';
import AmountPopover from '~/components/AmountPopover';
import ClaimPayment from '~/components/ClaimPayment';
import Withdraw from '~/components/Withdraw';
import { erc20Contract, offerContract } from '~/helpers/contracts';
import { Status } from '~/helpers/types';
import useAccept from '~/hooks/useAccept';
import useContractWriteComplete from '~/hooks/useContractWriteComplete';
import useToast from '~/hooks/useToast';
import { OfferContext } from './Offer';

interface OfferAction extends OfferContext {
  address: Address;
}

const OfferAction: React.FC<OfferAction> = ({
  address,
  status,
  onStatusUpdate,
  onTotalDepositUpdate,
  loading,
  creator,
  srcDecimals,
  destDecimals,
  domainOwner,
  destAsset,
  srcAsset,
}) => {
  const { address: walletAddr } = useAccount();

  const client = usePublicClient();

  const { toastSuccess, toastError } = useToast();

  const [timestamp, setTimestamp] = useState<number>(0);

  useEffect(() => {
    client.getBlock().then((block) => setTimestamp(Number(block.timestamp)));

    const timer = setInterval(() => setTimestamp((prev) => prev + 1), 1000);

    return () => clearInterval(timer);
  }, [client]);

  const [paymentBalanceForDepositor, setPaymentBalanceForDepositor] = useState<bigint>(0n);

  const [paymentBalanceForDomainOwner, setPaymentBalanceForDomainOwner] = useState<bigint>(0n);

  const { write: closeOffer, isLoading: isClosing } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'close',
    description: 'Closing offer',
    onSuccess: (data) => {
      onStatusUpdate(Status.Closed);
      toastSuccess({
        title: 'Offer has been closed',
        txHash: data.transactionHash,
      });
    },
  });

  const {
    destBalance,
    acceptAmount,
    isLoading: isAccepting,
    onAccept,
  } = useAccept({
    userAddress: walletAddr!,
    offerAddress: address,
    destAsset,
    onSuccess: (data) => {
      onStatusUpdate(Status.Accepted);
      toastSuccess({
        title: 'Offer has been accepted',
        txHash: data.transactionHash,
      });
    },
  });

  const { write: depositFund, isLoading: isDepositing } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'deposit',
    description: 'Depositing',
    onSuccess: (data) => {
      refetchDeposit();
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
      refetchDeposit();
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
      setPaymentBalanceForDepositor(0n);
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
      setPaymentBalanceForDomainOwner(0n);
      toastSuccess({ title: 'Payment has been withdrawn', txHash: data.transactionHash });
    },
    onError: (error) => toastError({ title: 'Failed to withdraw the payment', description: error.message }),
    args: [],
  });

  const {
    data: depositInfo,
    refetch: refetchDeposit,
    isRefetching: isDepositLoading,
  } = useContractReads({
    contracts: [
      {
        ...offerContract(address),
        functionName: 'totalDeposits',
      },
      {
        ...offerContract(address),
        functionName: 'paymentBalanceForDomainOwner',
      },
      {
        ...offerContract(address),
        functionName: 'paymentBalanceForDepositor',
        args: [walletAddr!],
      },
      {
        ...offerContract(address),
        functionName: 'deposits',
        args: [walletAddr!],
      },
      {
        ...offerContract(address),
        functionName: 'lockWithdrawUntil',
        args: [walletAddr!],
      },
      {
        ...erc20Contract(srcAsset),
        functionName: 'balanceOf',
        args: [walletAddr!],
      },
    ],
    onSuccess: ([totalDeposits, paymentBalanceForDomainOwner, paymentBalanceForDepositor]) => {
      onTotalDepositUpdate(totalDeposits.result as bigint);
      setPaymentBalanceForDomainOwner(paymentBalanceForDomainOwner.result as bigint);
      setPaymentBalanceForDepositor(paymentBalanceForDepositor.result as bigint);
    },
  });

  const deposit = depositInfo?.[3].result as bigint;
  const lockWithdrawUntil = depositInfo?.[4].result as bigint;
  const srcBalance = depositInfo?.[5].result as bigint;

  const working =
    loading ||
    isClosing ||
    isAccepting ||
    isDepositing ||
    isWithdrawing ||
    isDepositLoading ||
    isClaimingDepositorPayment ||
    isClaimingDomainOwnerPayment;

  if (depositInfo === undefined) {
    return <Spinner />;
  }

  return (
    <VStack width="full">
      {deposit === 0n && <Text>You can deposit your funds or accept the offer</Text>}
      <Text textAlign="right">Deposit</Text>
      <Text>{formatUnits(deposit, srcDecimals)}</Text>

      {status !== Status.Accepted ? (
        deposit > 0 && (
          <AmountPopover
            max={deposit}
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
  );
};

export default OfferAction;

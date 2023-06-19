import React, { useEffect, useState } from 'react';
import { Alert, AlertIcon, Box, Button, Text } from '@chakra-ui/react';
import { Address } from 'abitype';
import { formatUnits } from 'viem';
import { useAccount, useContractReads, usePublicClient } from 'wagmi';
import ClaimPayment from '~/components/ClaimPayment';
import Withdraw from '~/components/Withdraw';
import { erc20Contract, offerContract } from '~/helpers/contracts';
import { Status } from '~/helpers/types';
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

  const { write: acceptOffer, isLoading: isAccepting } = useContractWriteComplete({
    ...offerContract(address),
    functionName: 'accept',
    description: 'Accepting offer',
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
    enabled: false,
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
    ],
    onSuccess: ([totalDeposits, paymentBalanceForDomainOwner, paymentBalanceForDepositor]) => {
      onTotalDepositUpdate(totalDeposits.result as bigint);
      setPaymentBalanceForDomainOwner(paymentBalanceForDomainOwner.result as bigint);
      setPaymentBalanceForDepositor(paymentBalanceForDepositor.result as bigint);
    },
  });

  const { data: destAssetInfo } = useContractReads({
    contracts: [
      {
        ...erc20Contract(destAsset),
        functionName: 'balanceOf',
      },
      {
        ...offerContract(address),
        functionName: 'acceptAmount',
      },
    ],
  });

  const destBalance = destAssetInfo?.[0].result as bigint;
  const acceptAmount = destAssetInfo?.[1].result as bigint;

  const { result: deposit } = depositInfo?.[3] ?? {};
  const { result: lockWithdrawUntil } = depositInfo?.[4] ?? {};

  const working =
    loading ||
    isClosing ||
    isAccepting ||
    isDepositing ||
    isWithdrawing ||
    isDepositLoading ||
    isClaimingDepositorPayment ||
    isClaimingDomainOwnerPayment;

  return (
    <Box>
      {deposit === 0n && <Text>You can deposit your funds or accept the offer</Text>}
      <Text textAlign="right">Deposit</Text>
      <Text>{formatUnits(deposit as bigint, srcDecimals)}</Text>

      {status !== Status.Accepted ? (
        (deposit as bigint) > 0 && (
          <Withdraw
            lockWithdrawUntil={Number(lockWithdrawUntil)}
            timestamp={timestamp}
            disabled={working}
            isWithdrawing={isWithdrawing}
            onClick={withdraw} // todo
          />
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
          <Button
            onClick={() => depositFund()} // todo
            isDisabled={working}
            isLoading={isDepositing}
            loadingText="Deposit"
          >
            Deposit
          </Button>
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
                onClick={() => acceptOffer?.()}
                isDisabled={working || destBalance < acceptAmount}
                isLoading={isAccepting}
                loadingText="Accept"
              >
                Accept
              </Button>
            </>
          )}
          {creator === walletAddr && (
            <Button onClick={() => closeOffer?.()} isDisabled={working} isLoading={isClosing} loadingText="Close">
              Close
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default OfferAction;

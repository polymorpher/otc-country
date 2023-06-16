import React, { useEffect, useState } from 'react';
import { Alert, AlertIcon, Box, Button, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { useAccount, useContractRead, useContractReads, useContractWrite, usePublicClient } from 'wagmi';
import ClaimPayment from '~/components/ClaimPayment';
import OfferStatus from '~/components/OfferStatus';
import Withdraw from '~/components/Withdraw';
import { erc20Contract, offerContract, otcContract } from '~/helpers/contracts';
import { formatSeconds } from '~/helpers/time';
import { divideByDecimals } from '~/helpers/token';
import { Status } from '~/helpers/types';
import useToast from '~/hooks/useToast';

interface OfferProps {
  address: Address;
}

const Offer: React.FC<OfferProps> = ({ address }) => {
  const { address: walletAddr, isConnected } = useAccount();

  const [status, setStatus] = useState<Status>();

  const [paymentBalanceForDepositor, setPaymentBalanceForDepositor] = useState<bigint>(0n);

  const [paymentBalanceForDomainOwner, setPaymentBalanceForDomainOwner] = useState<bigint>(0n);

  const client = usePublicClient();

  const { toastSuccess, toastError } = useToast();

  const [timestamp, setTimestamp] = useState<number>(0);

  useEffect(() => {
    client.getBlock().then((block) => setTimestamp(Number(block.timestamp)));

    const timer = setInterval(() => setTimestamp((prev) => prev + 1), 1000);

    return () => clearInterval(timer);
  }, [client]);

  const { isLoading: isStatusLoading } = useContractRead({
    ...offerContract(address),
    functionName: 'status',
    onSuccess: setStatus,
  });

  const { write: closeOffer, isLoading: isClosing } = useContractWrite({
    ...offerContract(address),
    functionName: 'close',
    onSuccess: () => setStatus(Status.Closed),
  });

  const { write: acceptOffer, isLoading: isAccepting } = useContractWrite({
    ...offerContract(address),
    functionName: 'accept', // todo: send value
    onSuccess: () => setStatus(Status.Accepted),
  });

  const {
    data: [deposit, totalDeposits, lockWithdrawUntil],
    refetch: refetchDeposit,
    isLoading: isDepositLoading,
  } = useContractReads({
    enabled: false,
    contracts: [
      {
        ...offerContract(address),
        functionName: 'deposits',
        args: [walletAddr!],
      },
      {
        ...offerContract(address),
        functionName: 'totalDeposits',
      },
      {
        ...offerContract(address),
        functionName: 'lockWithdrawUntil',
        args: [walletAddr!],
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
    ],
    onSuccess: ([
      _deposit,
      _totalDeposits,
      _lockWithdrawUntil,
      paymentBalanceForDomainOwner,
      paymentBalanceForDepositor,
    ]) => {
      setPaymentBalanceForDomainOwner(paymentBalanceForDomainOwner.result as bigint);
      setPaymentBalanceForDepositor(paymentBalanceForDepositor.result as bigint);
    },
  });

  const { write: depositFund, isLoading: isDepositing } = useContractWrite({
    ...offerContract(address),
    functionName: 'deposit',
    onSuccess: () => refetchDeposit(),
    args: [],
  });

  const { write: withdraw, isLoading: isWithdrawing } = useContractWrite({
    ...offerContract(address),
    functionName: 'withdraw',
    onSuccess: () => refetchDeposit(),
    args: [],
  });

  const { write: claimDepositorPayment, isLoading: isClaimingDepositorPayment } = useContractWrite({
    ...offerContract(address),
    functionName: 'withdrawPaymentForDepositor',
    onSuccess: () => {
      toastSuccess({ title: 'Payment has been withdrawn' });
      setPaymentBalanceForDepositor(0n);
    },
    onError: (error) => toastError({ title: 'Failed to withdraw the payment', description: error.message }),
    args: [],
  });

  const { write: claimDomainOwnerPayment, isLoading: isClaimingDomainOwnerPayment } = useContractWrite({
    ...offerContract(address),
    functionName: 'withdrawPaymentForDomainOwner',
    onSuccess: () => {
      toastSuccess({ title: 'Payment has been withdrawn' });
      setPaymentBalanceForDomainOwner(0n);
    },
    onError: (error) => toastError({ title: 'Failed to withdraw the payment', description: error.message }),
    args: [],
  });

  const {
    data: [commissionRateScale, creator, domainOwner, commissionRate, acceptAmount, srcAsset, destAsset],
    error,
    isLoading: isInfoLoading,
  } = useContractReads({
    onSuccess: () => {
      refetchSrcDecimals();
      refetchDestDecimals();
    },
    contracts: [
      {
        ...otcContract,
        functionName: 'commissionRateScale',
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
    ],
  });

  const { data: srcDecimals, refetch: refetchSrcDecimals } = useContractRead({
    ...erc20Contract(srcAsset),
    functionName: 'decimals',
    enabled: false,
  });

  const { data: destDecimals, refetch: refetchDestDecimals } = useContractRead({
    ...erc20Contract(destAsset),
    functionName: 'decimals',
    enabled: false,
  });

  const working =
    isClosing ||
    isAccepting ||
    isDepositing ||
    isWithdrawing ||
    isInfoLoading ||
    isStatusLoading ||
    isDepositLoading ||
    isClaimingDepositorPayment ||
    isClaimingDomainOwnerPayment;

  return (
    <VStack>
      {status !== undefined && <OfferStatus status={status} />}

      <Text>Offer information</Text>

      {isInfoLoading && <Spinner />}

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr" gridRowGap="2" gridColumnGap="2">
        <Text textAlign="right">Creator</Text>
        <Text>{creator === walletAddr ? 'You' : creator}</Text>

        <Text textAlign="right">Domain owner</Text>
        <Text>{domainOwner}</Text>

        <Text textAlign="right">commissionRate</Text>
        <Text>{commissionRate / commissionRateScale}</Text>

        <Text textAlign="right">acceptAmount</Text>
        <Text>{acceptAmount}</Text>

        <Text textAlign="right">Source asset</Text>
        <Text>{srcAsset}</Text>

        <Text textAlign="right">Destination asset</Text>
        <Text>{destAsset}</Text>

        <Text textAlign="right">Total deposits</Text>
        <Text>{totalDeposits}</Text>
      </Box>

      {isConnected && (
        <Box>
          {deposit === 0n && <Text>You can deposit your funds or accept the offer</Text>}
          <Text textAlign="right">Deposit</Text>
          <Text>{divideByDecimals(deposit, Number(srcDecimals))}</Text>

          {status !== Status.Accepted ? (
            deposit > 0 && (
              <Withdraw
                lockWithdrawUntil={Number(lockWithdrawUntil)}
                timestamp={timestamp}
                disabled={working}
                isWithdrawing={isWithdrawing}
                onClick={withdraw}
              />
            )
          ) : walletAddr === domainOwner ? (
            <ClaimPayment
              balance={paymentBalanceForDomainOwner}
              decimals={Number(destDecimals)}
              onClick={() => claimDomainOwnerPayment({ args: [walletAddr] })}
              isClaiming={isClaimingDomainOwnerPayment}
              disabled={working}
            />
          ) : (
            <ClaimPayment
              balance={paymentBalanceForDepositor}
              decimals={Number(destDecimals)}
              onClick={() => claimDepositorPayment({ args: [walletAddr] })}
              isClaiming={isClaimingDepositorPayment}
              disabled={working}
            />
          )}

          {status === Status.Open && (
            <>
              <Button onClick={depositFund} isDisabled={working} isLoading={isDepositing} loadingText="Deposit">
                Deposit
              </Button>
              {deposit === 0n && (
                <Button onClick={() => acceptOffer()} isDisabled={working} isLoading={isAccepting} loadingText="Accept">
                  Accept
                </Button>
              )}
              {creator === walletAddr && (
                <Button onClick={() => closeOffer()} isDisabled={working} isLoading={isClosing} loadingText="Close">
                  Close
                </Button>
              )}
            </>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default Offer;

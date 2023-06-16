import React, { useEffect, useState } from 'react';
import { Alert, AlertIcon, Box, Button, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { useAccount, useContractRead, useContractReads, useContractWrite, usePublicClient } from 'wagmi';
import OfferStatus from '~/components/OfferStatus';
import { offerContract, otcContract } from '~/helpers/contracts';
import { Status } from '~/helpers/types';
import { formatSeconds } from '~/helpers/time';

interface OfferProps {
  address: Address;
}

const Offer: React.FC<OfferProps> = ({ address }) => {
  const { address: walletAddr, isConnected } = useAccount();

  const [status, setStatus] = useState<Status>();

  const client = usePublicClient();

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
    functionName: 'accept',
    onSuccess: () => setStatus(Status.Accepted),
  });

  const {
    data: [deposit, totalDeposits, paymentBalanceForDomainOwner, paymentBalanceForDepositor, lockWithdrawUntil],
    refetch: refetchDeposit,
    isLoading: isDepositLoading,
  } = useContractReads({
    contracts: [
      {
        ...offerContract(address),
        functionName: 'deposits',
        args: [walletAddr],
      },
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
        args: [walletAddr],
      },
      {
        ...offerContract(address),
        functionName: 'lockWithdrawUntil',
        args: [walletAddr],
      },
    ],
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

  const {
    data: [commissionRateScale, creator, domainOwner, commissionRate, acceptAmount, srcAsset, destAsset],
    error,
    isLoading: isInfoLoading,
  } = useContractReads({
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

  const working =
    isClosing || isAccepting || isDepositing || isWithdrawing || isInfoLoading || isStatusLoading || isDepositLoading;
  lockWithdrawUntil;
  return (
    <VStack>
      <OfferStatus status={status} />

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

        <Text textAlign="right">Deposit</Text>
        <Text>{deposit}</Text>

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

      {status !== Status.Accepted ? (
        deposit > 0 && (
          <>
            <Text textAlign="right">Withdraw locked left</Text>
            <Text>{formatSeconds(Number(lockWithdrawUntil) - timestamp)}</Text>
            <Button onClick={withdraw} isDisabled={Number(lockWithdrawUntil) > timestamp}>
              Withdraw
            </Button>
          </>
        )
      ) : walletAddr === domainOwner ? (
        <>
          <Text textAlign="right">Payment balance</Text>
          <Text>{paymentBalanceForDomainOwner}</Text>
          <Button isDisabled={paymentBalanceForDomainOwner === 0n}>Claim payment</Button>
        </>
      ) : (
        <>
          <Text textAlign="right">Payment balance</Text>
          <Text>{paymentBalanceForDepositor}</Text>
          <Button isDisabled={paymentBalanceForDepositor === 0n}>Claim payment</Button>
        </>
      )}

      {status === Status.Open && (
        <>
          <Button onClick={depositFund}>Deposit</Button>
          {deposit === 0n && (
            <Button onClick={acceptOffer} isDisabled={working} isLoading={isAccepting} loadingText="Accept">
              Accept
            </Button>
          )}
          {creator === walletAddr && (
            <Button onClick={closeOffer} isDisabled={working} isLoading={isClosing} loadingText="Close">
              Close
            </Button>
          )}
        </>
      )}
    </VStack>
  );
};

export default Offer;

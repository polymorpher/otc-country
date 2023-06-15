import React from 'react';
import { Alert, AlertIcon, Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { useAccount, useContractReads } from 'wagmi';
import { offerContract, otcContract } from '~/helpers/contracts';

interface OfferProps {
  address: Address;
}

const Offer: React.FC<OfferProps> = ({ address }) => {
  const { address: walletAddr } = useAccount();

  const {
    data: [
      commissionRateScale,
      creator,
      deposit,
      domainOwner,
      commissionRate,
      acceptAmount,
      srcAsset,
      destAsset,
      lockWithdrawUntil,
      totalDeposits,
      status,
    ],
    refetch,
    error,
    isLoading,
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
        functionName: 'deposits',
        args: [walletAddr],
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
        ...offerContract(address),
        functionName: 'lockWithdrawUntil',
        args: [walletAddr],
      },
      {
        ...offerContract(address),
        functionName: 'totalDeposits',
      },
      {
        ...offerContract(address),
        functionName: 'status',
      },
    ],
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error.message}
      </Alert>
    );
  }

  return (
    <VStack>
      <Text>Offer information</Text>
      <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr" gridRowGap="2" gridColumnGap="2">
        <Text textAlign="right">creator</Text>
        <Text>{creator}</Text>

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

        <Text textAlign="right">Withdraw locked left</Text>
        <Text>{lockWithdrawUntil}</Text>

        <Text textAlign="right">Total deposits</Text>
        <Text>{totalDeposits}</Text>

        <Text textAlign="right">status</Text>
        <Text>{status}</Text>
      </Box>
      {children}
    </VStack>
  );
};

export default Offer;

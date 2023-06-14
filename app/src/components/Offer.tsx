import React from 'react';
import { Alert, AlertIcon, Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { useContractReads } from 'wagmi';
import { offerContract, otcContract } from '~/helpers/contracts';

interface OfferProps {
  address: Address;
  children: JSX.Element;
}

const Offer: React.FC<OfferProps> = ({ address, children }) => {
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
      lockWithdrawDuration,
      lockWithdrawUntil,
      totalDeposits,
      status,
    ],
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
        args: [address],
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
      <Box>
        <Text>Creator</Text>
        <Text>{creator}</Text>
      </Box>
      {children}
    </VStack>
  );
};

export default Offer;

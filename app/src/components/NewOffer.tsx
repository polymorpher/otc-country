import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect, useSwitchNetwork, useNetwork } from 'wagmi';

interface NewOfferProps {
  domain: string;
}

const NewOffer: React.FC<NewOfferProps> = ({ domain }) => {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Box>
        <Text>Offer is available from the given domain. Please connect your wallet to proceed.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text>Please create a new offer with the following information.</Text>
    </Box>
  );
};

export default NewOffer;

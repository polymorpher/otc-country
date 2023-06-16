import React from 'react';
import { Button, Alert, AlertIcon, Spacer } from '@chakra-ui/react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import chain from '~/helpers/chain';

const ChainDetector = () => {
  const { isConnected } = useAccount();

  const { isLoading, switchNetwork } = useSwitchNetwork({ chainId: chain.id });

  const { chain: currentChain } = useNetwork();

  if (!isConnected || currentChain?.id === chain.id) {
    return null;
  }

  return (
    <Alert status="warning">
      <AlertIcon />
      Your metamask is on a wrong chain.
      <br />
      Please switch to {chain.name} to continue.
      <Spacer />
      <Button colorScheme="yellow" onClick={() => switchNetwork?.()} isLoading={isLoading} loadingText="Switch">
        Switch
      </Button>
    </Alert>
  );
};

export default ChainDetector;

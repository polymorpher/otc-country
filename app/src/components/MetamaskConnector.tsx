import React from 'react';
import { Button, Box, Text, Alert, AlertIcon, HStack, Tooltip, Spacer } from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { shortenAddress } from '~/helpers/address';
import { connector } from '~/main';

const MetamskConnector = () => {
  const { address, isConnected } = useAccount();

  const { connect, isLoading, error, pendingConnector } = useConnect();

  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <HStack padding="4" border="1px solid gray" borderRadius="lg" width="full">
        <Box>
          <Tooltip label={address}>
            <Text>{shortenAddress(address)}</Text>
          </Tooltip>
          <Text color="gray.500">Connected to {connector.name}</Text>
        </Box>
        <Spacer />
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </HStack>
    );
  }

  return (
    <Box>
      <Button
        disabled={!connector.ready}
        onClick={() => connect({ connector })}
        isLoading={isLoading && connector.id === pendingConnector?.id}
        loadingText={connector.name}
      >
        {connector.name}
        {!connector.ready && ' (unsupported)'}
      </Button>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}
    </Box>
  );
};

export default MetamskConnector;

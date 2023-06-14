import React from 'react';
import { Button, Image, Box, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import { connector } from '~/main';

const MetamskConnector = () => {
  const { address, isConnected } = useAccount();

  const { connect, isLoading, error, pendingConnector } = useConnect();

  const { disconnect } = useDisconnect();

  const { data: ensAvatar } = useEnsAvatar({ address });

  const { data: ensName } = useEnsName({ address });

  if (isConnected) {
    return (
      <Box>
        {ensAvatar && <Image src={ensAvatar} alt="ENS Avatar" />}
        <Text>{ensName ? `${ensName} (${address})` : address}</Text>
        <Text>Connected to {connector.name}</Text>
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </Box>
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

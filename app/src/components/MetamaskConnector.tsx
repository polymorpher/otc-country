import React from 'react'
import { Button, Box, Text, Alert, AlertIcon, HStack, Spacer } from '@chakra-ui/react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { connector } from '~/main'
import AddressField from './AddressField'

const MetamskConnector = (): React.JSX.Element => {
  const { address, isConnected } = useAccount()

  const { connect, isLoading, error, pendingConnector } = useConnect()

  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <HStack padding="4" border="1px solid gray" borderRadius="lg" width="full">
        <Box>
          <AddressField shorten>{address}</AddressField>
          <Text color="gray.500">Connected to {connector.name}</Text>
        </Box>
        <Spacer />
        <Button onClick={() => { disconnect() }}>Disconnect</Button>
      </HStack>
    )
  }

  return (
    <Box>
      <Button
        disabled={!connector.ready}
        onClick={() => { connect({ connector }) }}
        isLoading={isLoading && connector.id === pendingConnector?.id}
        loadingText={connector.name}
      >
        CONNECT WALLET: {connector.name}
        {!connector.ready && ' (unsupported)'}
      </Button>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}
    </Box>
  )
}

export default MetamskConnector

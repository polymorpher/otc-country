import React from 'react'
import { Button, Alert, AlertIcon, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, VStack } from '@chakra-ui/react'
import { useAccount, useSwitchChain } from 'wagmi'
import chain from '~/helpers/chain'

const ChainDetector = (): React.JSX.Element | null => {
  const { isConnected, chain: currentChain } = useAccount()

  const { status, switchChain } = useSwitchChain()

  return (
    <Drawer placement="bottom" isOpen={isConnected && currentChain?.id !== chain.id} onClose={() => true}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth='1px'>
          Wallet connected to unsupported network
        </DrawerHeader>
        <DrawerBody>
          <Alert status="warning" flexDir="column" as={VStack} textAlign="center">
            <AlertIcon boxSize="24" />
            <div>Please switch to {chain.name} to continue</div>
            <Button
              colorScheme="yellow"
              onClick={() => { switchChain({ chainId: chain.id }) }}
              isLoading={status === 'pending'}
              loadingText="Switch"
            >
              Switch
            </Button>
          </Alert>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ChainDetector

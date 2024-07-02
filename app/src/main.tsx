import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, Container, VStack } from '@chakra-ui/react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import App from '~/app';
import chain from '~/helpers/chain';
import * as CONFIG from '~/helpers/config';
import PendingTransactionsProvider from '~/providers/PendingTransactionsProvider';
import ChainDetector from './components/ChainDetector';
import MetamskConnector from './components/MetamaskConnector';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [chain],
  // [alchemyProvider({ apiKey: CONFIG.alchemyApiKey }), publicProvider()],
  [alchemyProvider({ apiKey: CONFIG.alchemyApiKey }), publicProvider()],
);

export const connector = new MetaMaskConnector({ chains });

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <Container my="10">
        <WagmiConfig config={config}>
          <PendingTransactionsProvider>
            <VStack>
              <MetamskConnector />
              <ChainDetector />
              <App />
            </VStack>
          </PendingTransactionsProvider>
        </WagmiConfig>
      </Container>
    </ChakraProvider>
  </React.StrictMode>,
);

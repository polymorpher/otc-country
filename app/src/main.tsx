import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, Container } from '@chakra-ui/react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import App from '~/app';
import chain from '~/helpers/chain';
import * as CONFIG from '~/helpers/config';
import PendingTransactionsProvider from '~/providers/PendingTransactionsProvider';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [chain],
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
            <App />
          </PendingTransactionsProvider>
        </WagmiConfig>
      </Container>
    </ChakraProvider>
  </React.StrictMode>,
);

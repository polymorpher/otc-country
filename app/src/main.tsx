import React from 'react'
import ReactDOM from 'react-dom/client'
import { extendTheme, ChakraProvider, Container, VStack } from '@chakra-ui/react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import App from '~/app'
import chain from '~/helpers/chain'
import PendingTransactionsProvider from '~/providers/PendingTransactionsProvider'
import ChainDetector from './components/ChainDetector'
import MetamskConnector from './components/MetamaskConnector'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { RPC, WS } from '~/helpers/config'
import Intro from '~/components/Intro'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [chain],
  // [alchemyProvider({ apiKey: CONFIG.alchemyApiKey }), publicProvider()],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: RPC,
        ws: WS
      })
    })
  ]
)

export const connector = new MetaMaskConnector({ chains })

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient
})

const theme = extendTheme({
  fonts: {
    heading: 'DecimaMono, system-ui',
    body: 'DecimaMono, system-ui'
  },
  styles: {
    global: {
      body: {
        textTransform: 'uppercase',
        margin: 0
      },
      button: { textTransform: 'uppercase' }
    }
  }
})

export default theme

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Container my="10">
        <WagmiConfig config={config}>
          <PendingTransactionsProvider>
            <VStack>
              <Intro/>
              <MetamskConnector />
              <ChainDetector />
              <App />
            </VStack>
          </PendingTransactionsProvider>
        </WagmiConfig>
      </Container>
    </ChakraProvider>
  </React.StrictMode>
)

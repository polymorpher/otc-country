import React from 'react'
import ReactDOM from 'react-dom/client'
import { extendTheme, ChakraProvider, Container, VStack, Stack } from '@chakra-ui/react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import App from '~/app'
import chain from '~/helpers/chain'
import PendingTransactionsProvider from '~/providers/PendingTransactionsProvider'
import EventHistory from './pages/EventHistory'
import Offer from './pages/Offer'
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

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Stack alignItems="flex-start" spacing="24" w="100%" direction={['column', 'column', 'row']}>
        <VStack w="100%">
          <MetamskConnector />
          <ChainDetector />
          <App />
        </VStack>
        <EventHistory minW={['full', 'full', '400px']} width={['full', 'full', 'auto']} />
      </Stack>
    )
  },
  {
    path: '/offer/:address',
    element: (
      <Offer />
    )
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <Container my="10" maxW="container.xl">
      <WagmiConfig config={config}>
        <PendingTransactionsProvider>
          <VStack>
            <Intro/>
            <RouterProvider router={router} />
          </VStack>
        </PendingTransactionsProvider>
      </WagmiConfig>
    </Container>
  </ChakraProvider>
)

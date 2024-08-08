import React from 'react'
import ReactDOM from 'react-dom/client'
import { extendTheme, ChakraProvider, Container } from '@chakra-ui/react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import LandingPage from '~/routes/index'
import NewOffer from '~/routes/new'
import Offer from './routes/offer'
import PendingTransactionsProvider from '~/providers/PendingTransactionsProvider'
import ErrorProvider from './providers/ErrorProvider'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import chain from '~/helpers/chain'
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
    element: <LandingPage />
  },
  {
    path: '/new',
    element: <NewOffer />
  },
  {
    path: '/offer/:address',
    element: <Offer />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <Container my="10" maxW="container.sm">
      <WagmiConfig config={config}>
        <PendingTransactionsProvider>
          <ErrorProvider>
            <Intro/>
            <RouterProvider router={router} />
          </ErrorProvider>
        </PendingTransactionsProvider>
      </WagmiConfig>
    </Container>
  </ChakraProvider>
)

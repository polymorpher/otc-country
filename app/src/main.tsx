import React from 'react'
import ReactDOM from 'react-dom/client'
import { extendTheme, ChakraProvider, Container } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ConnectKitProvider } from 'connectkit'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from '~/routes/index.js'
import NewOffer from '~/routes/new.js'
import Offer from '~/routes/offer.js'
import PendingTransactionsProvider from '~/providers/PendingTransactionsProvider.js'
import Intro from '~/components/Intro.js'
import { config } from '~/helpers/config.js'

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
    path: '/offer/:domain',
    element: <Offer />
  }
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <Container my="10" maxW="container.xl">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <PendingTransactionsProvider>
              <Intro />
              <RouterProvider router={router} />
            </PendingTransactionsProvider>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Container>
  </ChakraProvider>
)

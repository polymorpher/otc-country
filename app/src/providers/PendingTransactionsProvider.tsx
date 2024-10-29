import React, { useCallback, useContext, useRef } from 'react'
import {
  CloseButton,
  HStack,
  Spinner,
  Text,
  type ToastId,
  useToast,
  VStack
} from '@chakra-ui/react'
import TxHashLink from '~/components/TxHashLink'

interface TxToastDataBase {
  hash: string
}

interface PendingTransactionsContextValue {
  initiateNewTx: (
    data: TxToastDataBase & { title?: string; description?: string }
  ) => void
  completeTx: (data: TxToastDataBase) => void
}

const PendingTransactionsContext =
  React.createContext<PendingTransactionsContextValue>({
    initiateNewTx: () => false,
    completeTx: () => false
  })

interface PendingTransactionsProviderProps {
  children: React.ReactNode
}

const PendingTransactionsProvider: React.FC<
  PendingTransactionsProviderProps
> = ({ children }) => {
  const toast = useToast({
    position: 'top-right',
    variant: 'subtle',
    isClosable: true,
    duration: null,
    render: ({ onClose, title, description }) => (
      <HStack
        position="relative"
        bgColor="orange.100"
        borderRadius="md"
        padding="3"
        alignItems="start"
      >
        <Spinner color="orange" mt="sm" />
        <VStack alignItems="start">
          {title && <Text fontWeight="bold">{title}</Text>}
          {description}
        </VStack>
        <CloseButton
          position="absolute"
          right="2"
          top="2"
          size="sm"
          onClick={onClose}
        />
      </HStack>
    )
  })

  const toastIdRef = useRef<Record<string, ToastId>>({})

  const initiateNewTx: PendingTransactionsContextValue['initiateNewTx'] =
    useCallback(
      ({ hash, description, title }) => {
        toastIdRef.current = {
          ...toastIdRef.current,
          [hash]: toast({
            position: 'top-right',
            title,
            description: (
              <>
                {description && <Text>{description}</Text>}
                <TxHashLink hash={hash} />
              </>
            )
          })
        }
      },
      [toast]
    )

  return (
    <PendingTransactionsContext.Provider
      value={{
        initiateNewTx,
        completeTx: ({ hash }) => {
          toast.close(toastIdRef.current[hash])
        }
      }}
    >
      {children}
    </PendingTransactionsContext.Provider>
  )
}

export const usePendingTransactions = (): any =>
  useContext(PendingTransactionsContext)

export default PendingTransactionsProvider

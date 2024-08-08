import React, { useCallback, useContext, useState } from 'react'
import { Alert, AlertIcon, AlertTitle, AlertDescription, VStack, HStack } from '@chakra-ui/react'

interface ErrorProviderProps {
  children: React.ReactNode
}

interface ErrorInfo {
  title: string
  message: any
}

// eslint-disable-next-line @typescript-eslint/no-extra-parens
const ErrorContext = React.createContext<(data: ErrorInfo) => void>(() => true)

export const useShowError = () => useContext(ErrorContext)

const errorMessage = (error: any) => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return JSON.stringify(error)
}

const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<ErrorInfo>()

  return (
    <ErrorContext.Provider value={setError}>
      <VStack>
        {error && (
          <Alert status='error' display="block">
            <HStack>
              <AlertIcon />
              <AlertTitle>{error.title}</AlertTitle>
            </HStack>
            <AlertDescription>{errorMessage(error.message)}</AlertDescription>
          </Alert>
        )}
      </VStack>
      {children}
    </ErrorContext.Provider>
  )
}

export default ErrorProvider

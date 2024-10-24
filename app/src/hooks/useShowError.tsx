import { useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import errorMessage from '~/helpers/error'
import type { ErrorType } from '~/helpers/error'

interface ErrorInfo {
  title: string
  error: any
  type?: ErrorType
}

const useShowError = () => {
  const toast = useToast()

  const show = useCallback((data: ErrorInfo) => {
    toast({
      title: data.title,
      description: errorMessage(data.error, data.type),
      status: 'error',
      position: 'top-left',
      duration: 7000
    })
  }, [toast])

  return show
}

export default useShowError

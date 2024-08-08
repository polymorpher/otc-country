import { useCallback } from 'react'
import { useToast } from '@chakra-ui/react'

interface ErrorInfo {
  title: string
  message: any
}

const errorMessage = (error: any) => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return JSON.stringify(error)
}

const useShowError = () => {
  const toast = useToast()

  const show = useCallback((data: ErrorInfo) => {
    toast({
      title: data.title,
      description: errorMessage(data.message),
      status: 'error',
      position: 'top-left',
      duration: 7000
    })
  }, [toast])

  return show
}

export default useShowError

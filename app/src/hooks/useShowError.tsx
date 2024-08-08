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

  return (data: ErrorInfo) => {
    toast({
      title: data.title,
      description: errorMessage(data.message),
      status: 'error',
      duration: 7000
    })
  }
}

export default useShowError

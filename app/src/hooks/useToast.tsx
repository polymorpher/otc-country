import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react';

const useToast = () => {
  const toast = useChakraToast();

  const toastSuccess = (config: UseToastOptions) =>
    toast({
      status: 'success',
      duration: 5000,
      isClosable: true,
      ...config,
    });

  const toastError = (config: UseToastOptions) =>
    toast({
      status: 'error',
      duration: 10000,
      isClosable: true,
      ...config,
    });

  return {
    toastSuccess,
    toastError,
  };
};

export default useToast;

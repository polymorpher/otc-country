import React from 'react';
import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react';
import TxHashLink from '~/components/TxHashLink';

type ToastOptions = UseToastOptions & {
  txHash?: string;
};

const ToastBody: React.FC<ToastOptions> = ({ description, txHash }) => (
  <>
    {description}
    {txHash && <TxHashLink hash={txHash} />}
  </>
);

const useToast = () => {
  const toast = useChakraToast();

  const toastSuccess = (config: ToastOptions) =>
    toast({
      status: 'success',
      duration: 3000,
      isClosable: true,
      description: <ToastBody {...config} />,
      ...config,
    });

  const toastError = (config: ToastOptions) =>
    toast({
      status: 'error',
      duration: 10000,
      isClosable: true,
      description: <ToastBody {...config} />,
      ...config,
    });

  return {
    toastSuccess,
    toastError,
  };
};

export default useToast;

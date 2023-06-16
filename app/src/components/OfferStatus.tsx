import React from 'react';
import { Alert, AlertIcon } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { Status } from '~/helpers/types';

interface OfferStatusProps {
  status: Status;
}

const OfferStatus: React.FC<OfferStatusProps> = ({ status }) => {
  const { isConnected } = useAccount();

  switch (status) {
    case Status.Open:
      return (
        <Alert status="info">
          <AlertIcon />
          The offer is open.
          {!isConnected && 'Please connect your wallet to proceed.'}
        </Alert>
      );

    case Status.Accepted:
      return (
        <Alert status="success">
          <AlertIcon />
          The offer is accepted.
          {isConnected ? 'Please claim your payment.' : 'Please connect your wallet to claim your payment.'}
        </Alert>
      );

    case Status.Closed:
      return (
        <Alert status="error">
          <AlertIcon />
          The offer is closed.
          {isConnected
            ? 'Please withdraw your funds if you have any.'
            : 'Please connect your wallet to withdraw your funds if you have any.'}
        </Alert>
      );
  }
};

export default OfferStatus;

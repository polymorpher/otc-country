import React, { useState, useEffect } from 'react';
import { Alert, AlertIcon, Spinner, VStack } from '@chakra-ui/react';
import { useContractRead } from 'wagmi';
import { ethers } from 'ethers';
import DomainInput from './components/DomainInput';
import NewOffer from './components/NewOffer';
import Offer from './components/Offer';
import MetaMaskConnector from './components/MetamaskConnector';
import { otcContract } from './helpers/contracts';

const App = () => {
  const [domain, setDomain] = useState<string>();

  const {
    data: offerAddress,
    refetch,
    error,
    isLoading,
  } = useContractRead({
    ...otcContract,
    functionName: 'offerAddress',
    enabled: false,
    args: [domain],
  });

  useEffect(() => {
    if (domain) {
      refetch();
    }
  }, [domain, refetch]);

  return (
    <VStack>
      <DomainInput onChange={setDomain} />
      <MetaMaskConnector />
      {!domain ? (
        <Alert status="warning">
          <AlertIcon />
          Please enter domain name
        </Alert>
      ) : isLoading ? (
        <Spinner />
      ) : offerAddress === ethers.constants.AddressZero ? (
        <NewOffer domain={domain} onCreate={refetch} />
      ) : (
        <Offer address={offerAddress} />
      )}
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}
    </VStack>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { Alert, AlertIcon, Spinner, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { zeroAddress } from 'viem';
import { useAccount, useContractRead } from 'wagmi';
import DomainInput from '~/components/DomainInput';
import MetaMaskConnector from '~/components/MetamaskConnector';
import { otcContract } from '~/helpers/contracts';
import Admin from '~/pages/Admin';
import NewOffer from '~/pages/NewOffer';
import Offer from '~/pages/Offer';
import ChainDetector from './components/ChainDetector';

const App = () => {
  const { address, isConnected } = useAccount();

  const [domain, setDomain] = useState<string>();

  const {
    data: offerAddress,
    refetch,
    error,
    isRefetching,
  } = useContractRead({
    ...otcContract,
    functionName: 'offerAddress',
    enabled: false,
    args: [domain],
  });

  const { data: ownerAddress } = useContractRead({
    ...otcContract,
    functionName: 'owner',
  });

  useEffect(() => {
    if (domain) {
      refetch();
    }
  }, [domain, refetch]);

  if (isConnected && ownerAddress === address) {
    return (
      <VStack>
        <MetaMaskConnector />
        <Admin />
      </VStack>
    );
  }

  return (
    <VStack>
      <DomainInput onChange={setDomain} />
      <MetaMaskConnector />
      <ChainDetector />
      {!domain ? (
        <Alert status="warning">
          <AlertIcon />
          Please enter domain name
        </Alert>
      ) : isRefetching ? (
        <Spinner />
      ) : offerAddress === zeroAddress ? (
        <NewOffer domain={domain} onCreate={refetch} />
      ) : offerAddress ? (
        <Offer address={offerAddress as Address} />
      ) : null}
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

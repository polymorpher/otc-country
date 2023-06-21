import React, { useState, useEffect } from 'react';
import { Alert, AlertIcon, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { zeroAddress } from 'viem';
import { useAccount, useContractRead } from 'wagmi';
import DomainInput from '~/components/DomainInput';
import { otcContract } from '~/helpers/contracts';
import Admin from '~/pages/Admin';
import NewOffer from '~/pages/NewOffer';
import Offer from '~/pages/Offer';
import OfferAction from './pages/OfferAction';

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
    return <Admin />;
  }

  return (
    <VStack width="full">
      <DomainInput onChange={setDomain} loading={isRefetching} />
      {!domain ? (
        <Alert status="warning">
          <AlertIcon />
          Please enter domain name
        </Alert>
      ) : isRefetching ? null : offerAddress === zeroAddress ? (
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

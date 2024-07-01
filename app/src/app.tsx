import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertIcon, VStack } from '@chakra-ui/react';
import { readContract } from '@wagmi/core';
import { Address } from 'abitype';
import { zeroAddress } from 'viem';
import { useAccount, useContractRead } from 'wagmi';
import DomainInput from '~/components/DomainInput';
import { otcContract } from '~/helpers/contracts';
import Admin from '~/pages/Admin';
import NewOffer from '~/pages/NewOffer';
import Offer from '~/pages/Offer';

const App = () => {
  const { address, isConnected } = useAccount();

  const [domain, setDomain] = useState<string>();

  const [isFetching, setIsFetching] = useState<boolean>(false);

  const [offerAddress, setOfferAddress] = useState<Address>();

  const [error, setError] = useState<any>();

  const { data: ownerAddress } = useContractRead({
    ...otcContract,
    functionName: 'owner',
  });

  const refetch = useCallback((domain: string) => {
    if (!domain) {
      return;
    }

    setError(undefined);
    setOfferAddress(undefined);
    setIsFetching(true);

    readContract({
      ...otcContract,
      functionName: 'offerAddress',
      args: [domain],
    })
      .then((res) => setOfferAddress(res as Address))
      .catch(setError)
      .finally(() => setIsFetching(false));
  }, []);

  useEffect(() => {
    refetch('');
  }, [refetch]);

  const handleDomainChange = useCallback(
    (value: string) => {
      setDomain(value);
      refetch(value);
    },
    [refetch],
  );

  if (isConnected && ownerAddress === address) {
    return <Admin />;
  }

  return (
    <VStack width="full">
      <DomainInput onChange={handleDomainChange} loading={!error && isFetching} />
      {!domain ? (
        <Alert status="warning">
          <AlertIcon />
          Please enter domain name
        </Alert>
      ) : isFetching ? null : offerAddress === zeroAddress ? (
        <NewOffer domain={domain} onCreate={() => refetch(domain)} />
      ) : offerAddress ? (
        <Offer address={offerAddress as Address} />
      ) : null}
      {error && (
        <Alert status="error" wordBreak="break-word">
          <AlertIcon />
          {error.details}
        </Alert>
      )}
    </VStack>
  );
};

export default App;

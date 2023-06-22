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

const App = () => {
  const { address, isConnected } = useAccount();

  const [domain, setDomain] = useState<string>();

  const {
    data: offerAddress,
    refetch,
    error,
    isFetching,
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
      <DomainInput onChange={setDomain} loading={!error && isFetching} />
      {!domain ? (
        <Alert status="warning">
          <AlertIcon />
          Please enter domain name
        </Alert>
      ) : isFetching ? null : offerAddress === zeroAddress ? (
        <NewOffer domain={domain} onCreate={refetch} />
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

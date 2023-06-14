import React, { useState, useEffect } from 'react';
import { Alert, AlertIcon, Spinner, VStack } from '@chakra-ui/react';
import { useAccount, useContractRead, useContractReads } from 'wagmi';
import { BigNumber, ethers } from 'ethers';
import { Address } from 'abitype';
import DomainInput from './components/DomainInput';
import NewOffer from './components/NewOffer';
import OfferCreator from './components/OfferCreator';
import OfferDepositor from './components/OfferDepositor';
import OfferAcceptor from './components/OfferAcceptor';
import Offer from './components/Offer';
import MetaMaskConnector from './components/MetamaskConnector';
import { offerContract, otcContract } from './helpers/contracts';

const App = () => {
  const { address } = useAccount();

  const [domain, setDomain] = useState<string>();

  const {
    data: offerAddress,
    refetch: refetchOfferAddress,
    error: errorOfferAddress,
    isLoading: isLoadingOfferAddress,
  } = useContractRead({
    ...otcContract,
    functionName: 'offerAddress',
    enabled: false,
    args: [domain],
    onSuccess: () => {
      refetchOfferInfo();
    },
  });

  const {
    data: offerInfo,
    refetch: refetchOfferInfo,
    error: errorOfferInfo,
    isLoading: isLoadingOfferInfo,
  } = useContractReads({
    contracts: [
      {
        ...offerContract(offerAddress as Address),
        functionName: 'creator',
      },
      {
        ...offerContract(offerAddress as Address),
        functionName: 'deposits',
        args: [address],
      },
    ],
    enabled: false,
  });

  const error = errorOfferAddress ?? errorOfferInfo;

  const isLoading = isLoadingOfferAddress ?? isLoadingOfferInfo;

  useEffect(() => {
    if (domain) {
      refetchOfferAddress();
    }
  }, [domain]);

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
        <NewOffer domain={domain} />
      ) : (
        <Offer address={offerAddress}>
          {(refetch) =>
            address === offerInfo?.[0] ? (
              <OfferCreator refetch={refetch} />
            ) : BigNumber.from(offerInfo?.[1]).gt(0) ? (
              <OfferDepositor refetch={refetch} />
            ) : (
              <OfferAcceptor refetch={refetch} />
            )
          }
        </Offer>
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

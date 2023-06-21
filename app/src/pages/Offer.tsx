import React from 'react';
import { Alert, AlertIcon, Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import AddressField from '~/components/AddressField';
import OfferStatus from '~/components/OfferStatus';
import { Status } from '~/helpers/types';
import useOffer from '~/hooks/useOffer';

export interface OfferContext {
  status: Status;
  onStatusUpdate: (status: Status) => void;
  onTotalDepositUpdate: (value: bigint) => void;
  loading: boolean;
  creator: Address;
  domainOwner: Address;
  srcAsset: Address;
  destAsset: Address;
  srcDecimals: number;
  destDecimals: number;
}

interface OfferProps {
  address: Address;
  children: (context: OfferContext) => React.ReactNode;
}

const Offer: React.FC<OfferProps> = ({ address, children }) => {
  const { address: walletAddr } = useAccount();

  const {
    creator,
    domainOwner,
    commissionRate,
    acceptAmount,
    srcAsset,
    destAsset,
    commissionRateScale,
    srcDecimals,
    destDecimals,
    totalDeposits,
    status,
    setStatus,
    setTotalDeppsits,
    error,
    isLoading,
  } = useOffer({ address });

  return (
    <VStack width="full">
      {status !== undefined && <OfferStatus status={status} />}

      <Text fontSize="2xl" py="10">
        Offer information
      </Text>

      {isLoading && <Spinner />}

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}

      {!isLoading && (
        <Box display="grid" gridTemplateColumns="10em 1fr" gridRowGap="4" gridColumnGap="4">
          <Text textAlign="right">Creator</Text>
          <AddressField text={creator === walletAddr ? 'You' : undefined}>{String(creator)}</AddressField>

          <Text textAlign="right">Domain owner</Text>
          <AddressField>{String(domainOwner)}</AddressField>

          <Text textAlign="right">Commission rate</Text>
          <Text>{(Number(commissionRate) * 100) / Number(commissionRateScale)}%</Text>

          <Text textAlign="right">Accept amount</Text>
          <Text>{formatUnits(acceptAmount as bigint, Number(destDecimals))}</Text>

          <Text textAlign="right">Source asset</Text>
          <AddressField>{String(srcAsset)}</AddressField>

          <Text textAlign="right">Destination asset</Text>
          <AddressField>{String(destAsset)}</AddressField>

          <Text textAlign="right">Total deposits</Text>
          <Text>{formatUnits(totalDeposits, Number(srcDecimals))}</Text>
        </Box>
      )}

      {!isLoading &&
        status !== undefined &&
        children({
          status,
          onStatusUpdate: setStatus,
          onTotalDepositUpdate: setTotalDeppsits,
          loading: isLoading,
          creator: creator as Address,
          domainOwner: domainOwner as Address,
          srcAsset: srcAsset as Address,
          destAsset: destAsset as Address,
          srcDecimals: Number(srcDecimals),
          destDecimals: Number(destDecimals),
        })}
    </VStack>
  );
};

export default Offer;

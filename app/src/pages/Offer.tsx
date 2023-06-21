import React, { useState } from 'react';
import { Alert, AlertIcon, Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { formatUnits } from 'viem';
import { useAccount, useContractRead, useContractReads } from 'wagmi';
import AddressField from '~/components/AddressField';
import OfferStatus from '~/components/OfferStatus';
import { erc20Contract, offerContract, otcContract } from '~/helpers/contracts';
import { Status } from '~/helpers/types';

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

  const [status, setStatus] = useState<Status>();

  const [totalDeposits, setTotalDeppsits] = useState<bigint>();

  const { isLoading: isStatusLoading } = useContractRead({
    ...offerContract(address),
    functionName: 'status',
    onSuccess: setStatus,
  });

  const {
    data: info,
    error,
    isLoading: isInfoLoading,
  } = useContractReads({
    contracts: [
      {
        ...otcContract,
        functionName: 'commissionRateScale',
      },
      {
        ...offerContract(address),
        functionName: 'creator',
      },
      {
        ...offerContract(address),
        functionName: 'domainOwner',
      },
      {
        ...offerContract(address),
        functionName: 'commissionRate',
      },
      {
        ...offerContract(address),
        functionName: 'acceptAmount',
      },
      {
        ...offerContract(address),
        functionName: 'srcAsset',
      },
      {
        ...offerContract(address),
        functionName: 'destAsset',
      },
    ],
  });

  const { result: commissionRateScale } = info?.[0] ?? {};
  const { result: creator } = info?.[1] ?? {};
  const { result: domainOwner } = info?.[2] ?? {};
  const { result: commissionRate } = info?.[3] ?? {};
  const { result: acceptAmount } = info?.[4] ?? {};
  const { result: srcAsset } = info?.[5] ?? {};
  const { result: destAsset } = info?.[6] ?? {};

  const { data: srcDecimals } = useContractRead({
    ...erc20Contract(srcAsset as Address),
    functionName: 'decimals',
    enabled: false,
  });

  const { data: destDecimals } = useContractRead({
    ...erc20Contract(destAsset as Address),
    functionName: 'decimals',
    enabled: false,
  });

  return (
    <VStack width="full">
      {status !== undefined && <OfferStatus status={status} />}

      <Text fontSize="2xl" py="10">
        Offer information
      </Text>

      {isInfoLoading && <Spinner />}

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}

      {info && (
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
          {totalDeposits ? <Text>{formatUnits(totalDeposits, Number(srcDecimals))}</Text> : <Spinner />}
        </Box>
      )}

      {info &&
        status !== undefined &&
        children({
          status,
          onStatusUpdate: setStatus,
          onTotalDepositUpdate: setTotalDeppsits,
          loading: isInfoLoading || isStatusLoading,
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

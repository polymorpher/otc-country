import React, { useState } from 'react';
import { Alert, AlertIcon, Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { Address } from 'abitype';
import { useAccount, useContractRead, useContractReads } from 'wagmi';
import OfferStatus from '~/components/OfferStatus';
import { erc20Contract, offerContract, otcContract } from '~/helpers/contracts';
import { divideByDecimals } from '~/helpers/token';
import { Status } from '~/helpers/types';

export interface OfferContext {
  status: Status;
  onStateUpdate: (status: Status) => void;
  onTotalDepositUpdate: (value: bigint) => void;
  loading: boolean;
  creator: Address;
  domainOwner: Address;
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
    onSuccess: () => {
      refetchSrcDecimals();
      refetchDestDecimals();
    },
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

  const { data: srcDecimals, refetch: refetchSrcDecimals } = useContractRead({
    ...erc20Contract(srcAsset as Address),
    functionName: 'decimals',
    enabled: false,
  });

  const { data: destDecimals, refetch: refetchDestDecimals } = useContractRead({
    ...erc20Contract(destAsset as Address),
    functionName: 'decimals',
    enabled: false,
  });

  return (
    <VStack>
      {status !== undefined && <OfferStatus status={status} />}

      <Text>Offer information</Text>

      {isInfoLoading && <Spinner />}

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr" gridRowGap="2" gridColumnGap="2">
        <Text textAlign="right">Creator</Text>
        <Text>{creator === walletAddr ? 'You' : String(creator)}</Text>

        <Text textAlign="right">Domain owner</Text>
        <Text>{String(domainOwner)}</Text>

        <Text textAlign="right">Commission rate</Text>
        <Text>{(Number(commissionRate) * 100) / Number(commissionRateScale)}</Text>

        <Text textAlign="right">Accept amount</Text>
        <Text>{divideByDecimals(acceptAmount as bigint, Number(destDecimals))}</Text>

        <Text textAlign="right">Source asset</Text>
        <Text>{String(srcAsset)}</Text>

        <Text textAlign="right">Destination asset</Text>
        <Text>{String(destAsset)}</Text>

        <Text textAlign="right">Total deposits</Text>
        {totalDeposits ? <Text>{divideByDecimals(totalDeposits, Number(srcDecimals))}</Text> : <Spinner />}
      </Box>

      {status !== undefined &&
        children({
          status,
          onStateUpdate: setStatus,
          onTotalDepositUpdate: setTotalDeppsits,
          loading: isInfoLoading || isStatusLoading,
          creator: creator as Address,
          domainOwner: domainOwner as Address,
          srcDecimals: Number(srcDecimals),
          destDecimals: Number(destDecimals),
        })}
    </VStack>
  );
};

export default Offer;

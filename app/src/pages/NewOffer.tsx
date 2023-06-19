import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { readContract } from '@wagmi/core';
import { Address } from 'abitype';
import debounce from 'lodash/debounce';
import { isAddress, keccak256, toHex } from 'viem';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import * as yup from 'yup';
import { debounceTimeout } from '~/helpers/config';
import { otcContract, domainContract } from '~/helpers/contracts';

interface NewOfferProps {
  domain: string;
  onCreate: () => void;
}

const checkAssetAvailable = debounce(
  (asset: string) =>
    readContract({
      ...otcContract,
      functionName: 'assets',
      args: [asset],
    }).then((res) => !!res),
  debounceTimeout,
);

const schema = (commissionRate: number) =>
  yup.object({
    domainOwner: yup.string().required().test('address-syntax', 'invalid address', isAddress),
    srcAsset: yup
      .string()
      .required()
      .test('address-syntax', 'invalid address', isAddress)
      .test('asset-availability', 'not available', checkAssetAvailable),
    destAsset: yup
      .string()
      .required()
      .test('address-syntax', 'invalid address', isAddress)
      .test('asset-availability', 'not available', checkAssetAvailable),
    depositAmount: yup.number().required().min(0),
    acceptAmount: yup.number().required().min(0),
    commissionRate: yup.number().required().min(commissionRate),
    lockWithdrawDuration: yup.number().required().min(0),
  });

const NewOffer: React.FC<NewOfferProps> = ({ domain, onCreate }) => {
  const { isConnected } = useAccount();

  const { data: commissionRateScale } = useContractRead({
    ...otcContract,
    functionName: 'commissionRateScale',
  });

  const { data: domainContractAddress } = useContractRead({
    ...otcContract,
    functionName: 'domainContract',
  });

  const { refetch: refetchDomainPrice, isRefetching: isRefetchingDomainPrice } = useContractRead({
    ...domainContract(domainContractAddress as Address),
    functionName: 'getPrice',
    args: [domain],
    enabled: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValidating },
  } = useForm({
    resolver: yupResolver(schema(Number(commissionRateScale))),
  });

  const { write: createOffer, isLoading: isCreatingOffer } = useContractWrite({
    ...otcContract,
    functionName: 'createOffer',
    onSuccess: onCreate,
  });

  const handleCreateOffer: Parameters<typeof handleSubmit>[0] = useCallback(
    async (data) => {
      const domainPrice = await refetchDomainPrice();

      createOffer?.({
        args: [
          domain,
          keccak256(toHex(Math.random().toString())),
          data.domainOwner,
          data.srcAsset,
          data.destAsset,
          data.depositAmount,
          data.acceptAmount,
          data.commissionRate,
          data.lockWithdrawDuration,
        ],
        value: domainPrice.data as bigint,
      });
    },
    [createOffer, domain, refetchDomainPrice],
  );

  if (!isConnected) {
    return (
      <Alert status="info">
        <AlertIcon />
        Offer is available from the given domain. Please connect your wallet to proceed.
      </Alert>
    );
  }

  return (
    <Box>
      <Text>Please create a new offer with the following information.</Text>
      <form onSubmit={handleSubmit(handleCreateOffer)}>
        <FormControl isInvalid={!!errors.domainOwner}>
          <FormLabel>Domain owner</FormLabel>
          <Input {...register('domainOwner')} />
          <FormErrorMessage>{errors.domainOwner?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.srcAsset}>
          <FormLabel>Source asset</FormLabel>
          <InputGroup>
            <Input {...register('srcAsset')} />
            {isValidating && (
              <InputRightElement>
                <Spinner />
              </InputRightElement>
            )}
          </InputGroup>
          <FormErrorMessage>{errors.srcAsset?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.destAsset}>
          <FormLabel>Destination asset</FormLabel>
          <InputGroup>
            <Input {...register('destAsset')} />
            {isValidating && (
              <InputRightElement>
                <Spinner />
              </InputRightElement>
            )}
          </InputGroup>
          <FormErrorMessage>{errors.destAsset?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.depositAmount}>
          <FormLabel>Deposit amount</FormLabel>
          <Input {...register('depositAmount')} />
          <FormErrorMessage>{errors.depositAmount?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.acceptAmount}>
          <FormLabel>Accept amount</FormLabel>
          <Input {...register('acceptAmount')} />
          <FormErrorMessage>{errors.acceptAmount?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.commissionRate}>
          <FormLabel>Commission rate</FormLabel>
          <Input {...register('commissionRate')} />
          <FormErrorMessage>{errors.commissionRate?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.lockWithdrawDuration}>
          <FormLabel>Lock withdraw duration</FormLabel>
          <Input {...register('lockWithdrawDuration')} />
          <FormErrorMessage>{errors.lockWithdrawDuration?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" isLoading={isRefetchingDomainPrice || isCreatingOffer} loadingText="Create">
          Create
        </Button>
      </form>
    </Box>
  );
};

export default NewOffer;

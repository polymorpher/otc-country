import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { readContract } from '@wagmi/core';
import { Address } from 'abitype';
import debounce from 'lodash/debounce';
import { formatEther, isAddress } from 'viem';
import { useAccount, useContractRead } from 'wagmi';
import * as yup from 'yup';
import AmountPicker from '~/components/AmountPicker';
import chain from '~/helpers/chain';
import { debounceTimeout } from '~/helpers/config';
import { otcContract } from '~/helpers/contracts';
import useNewOffer from '~/hooks/useNewOffer';

interface NewOfferProps {
  domain: string;
  onCreate: () => void;
}

const checkAssetAvailable = debounce(
  (asset: string) =>
    isAddress(asset) &&
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
    depositAmount: yup.number().typeError('must be a number').required().min(0, 'min value 0'),
    acceptAmount: yup.number().typeError('must be a number').required().min(0, 'min value 0'),
    commissionRate: yup
      .number()
      .typeError('must be a number')
      .required()
      .max(commissionRate, `max value ${commissionRate}`),
    lockWithdrawDuration: yup.number().typeError('must be a number').required().min(0, 'min value 0'),
  });

const NewOffer: React.FC<NewOfferProps> = ({ domain, onCreate }) => {
  const { data: commissionRateScale } = useContractRead({
    ...otcContract,
    functionName: 'commissionRateScale',
  });

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isValidating, isDirty },
  } = useForm({
    resolver: yupResolver(schema(Number(commissionRateScale))),
  });

  const { address, isConnected } = useAccount();

  const { balance, domainPrice, srcBalance, srcDecimals, isRefetchingDomainPrice, isCreatingOffer, createOffer } =
    useNewOffer({
      address,
      srcAsset: getValues('srcAsset') as Address,
      domain,
      chainId: chain.id,
    });

  const isInvalidSrcAsset = srcBalance === undefined || srcDecimals === undefined;

  if (!isConnected) {
    return (
      <Alert status="info">
        <AlertIcon />
        Offer is available from the given domain. Please connect your wallet to proceed.
      </Alert>
    );
  }

  return (
    <VStack>
      <Text fontSize="2xl" my="10">
        Please create a new offer with the following information.
      </Text>

      {!isRefetchingDomainPrice && (
        <Alert status={balance > domainPrice ? 'info' : 'warning'}>
          <AlertIcon />
          It costs {formatEther(domainPrice as bigint)} ETH to buy that domain.
          {balance > domainPrice
            ? 'You will spend that amount of ETH to create an offer for the domain name.'
            : 'Your ETH balance is not sufficient now.'}
        </Alert>
      )}

      <VStack onSubmit={handleSubmit((data) => createOffer(data).then(onCreate))} as="form" width="full">
        <FormControl isInvalid={!!errors.domainOwner}>
          <FormLabel>Domain owner</FormLabel>
          <Input {...register('domainOwner')} />
          <FormErrorMessage>{errors.domainOwner?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.srcAsset || (isDirty && isInvalidSrcAsset)}>
          <FormLabel>Source asset</FormLabel>
          <InputGroup>
            <Input {...register('srcAsset')} />
            {isValidating && (
              <InputRightElement>
                <Spinner />
              </InputRightElement>
            )}
          </InputGroup>
          <FormErrorMessage>
            {errors.srcAsset?.message ?? (isDirty && isInvalidSrcAsset && 'source asset is invalid')}
          </FormErrorMessage>
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

        {!isInvalidSrcAsset && (
          <FormControl isInvalid={!!errors.depositAmount}>
            <FormLabel>Deposit amount</FormLabel>
            <Controller
              control={control}
              name="depositAmount"
              render={({ field }) => (
                <AmountPicker onChange={field.onChange} max={srcBalance} decimals={Number(srcDecimals)} />
              )}
            />
            <FormErrorMessage>{errors.depositAmount?.message}</FormErrorMessage>
          </FormControl>
        )}

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
        <Button type="submit" isLoading={isCreatingOffer} loadingText="Create">
          Create
        </Button>
      </VStack>
    </VStack>
  );
};

export default NewOffer;

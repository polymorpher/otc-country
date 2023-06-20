import React from 'react';
import { Controller, useForm, RegisterOptions } from 'react-hook-form';
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { readContract } from '@wagmi/core';
import { Address } from 'abitype';
import { formatEther, isAddress } from 'viem';
import { useAccount, useContractRead } from 'wagmi';
import AmountPicker from '~/components/AmountPicker';
import chain from '~/helpers/chain';
import { otcContract } from '~/helpers/contracts';
import useNewOffer from '~/hooks/useNewOffer';

interface NewOfferProps {
  domain: string;
  onCreate: () => void;
}

const checkAssetAvailable = (asset: string) =>
  readContract({
    ...otcContract,
    functionName: 'assets',
    args: [asset],
  }).then((res) => !!res);

const rules: Record<string, RegisterOptions> = {
  domainOwner: {
    required: 'required',
    validate: {
      address: (v: string) => isAddress(v) || 'not address format',
    },
  },
  srcAsset: {
    required: 'required',
    validate: {
      address: (v: string) => isAddress(v) || 'not address format',
      available: async (v: string) => (await checkAssetAvailable(v)) || 'not available',
    },
  },
  destAsset: {
    required: 'required',
    validate: {
      address: (v: string) => isAddress(v) || 'not address format',
      available: async (v: string) => (await checkAssetAvailable(v)) || 'not available',
    },
  },
  depositAmount: {
    required: 'required',
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'not number',
    },
    min: { value: 0, message: 'should be above 0' },
  },
  acceptAmount: {
    required: 'required',
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'not number',
    },
    min: { value: 0, message: 'should be above 0' },
  },
  commissionRate: {
    required: true,
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'not number',
    },
    min: { value: 0, message: 'should be above 0' },
  },
  lockWithdrawDuration: {
    required: true,
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'not number',
    },
    min: { value: 0, message: 'should be above 0' },
  },
};

const NewOffer: React.FC<NewOfferProps> = ({ domain, onCreate }) => {
  const { data: commissionRateScale } = useContractRead({
    ...otcContract,
    functionName: 'commissionRateScale',
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    formState: { errors, isDirty },
  } = useForm();

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

      {!isRefetchingDomainPrice && domainPrice !== undefined && (
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
          <Input {...register('domainOwner', rules.domainOwner)} />
          <FormErrorMessage>{errors.domainOwner?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.srcAsset || (isDirty && isInvalidSrcAsset)}>
          <FormLabel>Source asset</FormLabel>
          <Input {...register('srcAsset', rules.srcAsset)} />
          <FormErrorMessage>
            {errors.srcAsset?.message ?? (isDirty && isInvalidSrcAsset && 'source asset is not ERC20')}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.destAsset}>
          <FormLabel>Destination asset</FormLabel>
          <Input {...register('destAsset', rules.destAsset)} />

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
          <Input {...register('acceptAmount', rules.acceptAmount)} />
          <FormErrorMessage>{errors.acceptAmount?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.commissionRate}>
          <FormLabel>Commission rate</FormLabel>
          <Input
            {...register('commissionRate', {
              ...rules.commissionRate,
              max: {
                value: commissionRateScale,
                message: `should be less than ${commissionRateScale}`,
              },
            })}
          />
          {!errors.commissionRate && commissionRateScale !== undefined && watch('commissionRate') !== undefined && (
            <FormHelperText>{(Number(watch('commissionRate')) * 100) / Number(commissionRateScale)}%</FormHelperText>
          )}
          <FormErrorMessage>{errors.commissionRate?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.lockWithdrawDuration}>
          <FormLabel>Lock withdraw duration</FormLabel>
          <Input {...register('lockWithdrawDuration', rules.lockWithdrawDuration)} />
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

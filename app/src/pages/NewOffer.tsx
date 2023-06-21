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
import useToast from '~/hooks/useToast';

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
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero',
    },
  },
  acceptAmount: {
    required: 'required',
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero',
    },
  },
  commissionRate: {
    required: true,
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero',
    },
  },
  lockWithdrawDuration: {
    required: true,
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero',
    },
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
    formState: { errors },
  } = useForm();

  const { address, isConnected } = useAccount();

  const { toastSuccess, toastError } = useToast();

  const { balance, domainPrice, srcBalance, srcDecimals, isRefetchingDomainPrice, isCreatingOffer, createOffer } =
    useNewOffer({
      address,
      srcAsset: watch('srcAsset') as Address,
      domain,
      chainId: chain.id,
      onSuccess: (data) => {
        toastSuccess({
          title: 'Offer has been created',
          txHash: data.transactionHash,
        });
      },
      onSettled: (data, err) =>
        err &&
        toastError({
          title: 'Failed to create the offer',
          description: err.details,
          txHash: data?.transactionHash,
        }),
    });

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
          <FormErrorMessage>{errors.domainOwner?.message?.toString()}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.srcAsset}>
          <FormLabel>Source asset</FormLabel>
          <Input {...register('srcAsset', rules.srcAsset)} />
          <FormErrorMessage>{errors.srcAsset?.message?.toString()}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.destAsset}>
          <FormLabel>Destination asset</FormLabel>
          <Input {...register('destAsset', rules.destAsset)} />

          <FormErrorMessage>{errors.destAsset?.message?.toString()}</FormErrorMessage>
        </FormControl>

        {srcBalance !== undefined && srcDecimals !== undefined && (
          <FormControl isInvalid={!!errors.depositAmount}>
            <FormLabel>Deposit amount</FormLabel>
            <Controller
              control={control}
              name="depositAmount"
              rules={rules.depositAmount}
              render={({ field }) => (
                <AmountPicker
                  onChange={(value) => field.onChange(value.toString())}
                  max={srcBalance}
                  decimals={Number(srcDecimals)}
                />
              )}
            />
            <FormErrorMessage>{errors.depositAmount?.message?.toString()}</FormErrorMessage>
          </FormControl>
        )}

        <FormControl isInvalid={!!errors.acceptAmount}>
          <FormLabel>Accept amount</FormLabel>
          <Input {...register('acceptAmount', rules.acceptAmount)} />
          <FormErrorMessage>{errors.acceptAmount?.message?.toString()}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.commissionRate}>
          <FormLabel>Commission rate</FormLabel>
          <Input
            {...register('commissionRate', {
              ...rules.commissionRate,
              max: {
                value: Number(commissionRateScale),
                message: `should be less than ${commissionRateScale}`,
              },
            })}
          />
          {!errors.commissionRate && commissionRateScale !== undefined && !!watch('commissionRate') && (
            <FormHelperText>{(Number(watch('commissionRate')) * 100) / Number(commissionRateScale)}%</FormHelperText>
          )}
          <FormErrorMessage>{errors.commissionRate?.message?.toString()}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.lockWithdrawDuration}>
          <FormLabel>Lock withdraw duration</FormLabel>
          <Input {...register('lockWithdrawDuration', rules.lockWithdrawDuration)} />
          <FormErrorMessage>{errors.lockWithdrawDuration?.message?.toString()}</FormErrorMessage>
        </FormControl>
        <Button type="submit" isLoading={isCreatingOffer} loadingText="Create">
          Create
        </Button>
      </VStack>
    </VStack>
  );
};

export default NewOffer;

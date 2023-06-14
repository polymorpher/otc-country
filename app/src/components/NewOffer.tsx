import React from 'react';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, Text } from '@chakra-ui/react';
import * as ethers from 'ethers';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { readContract } from '@wagmi/core';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { otcContract } from '~/helpers/contracts';
import { regexEtherAddress } from '~/helpers/regex';

interface NewOfferProps {
  domain: string;
}

const checkAssetAvailable = (asset: string) =>
  readContract({
    ...otcContract,
    functionName: 'assets',
    args: [asset],
  }).then((res) => !!res);

const schema = (commissionRate: number) =>
  yup.object({
    domainOwner: yup.string().required().matches(regexEtherAddress),
    srcAsset: yup
      .string()
      .required()
      .matches(regexEtherAddress)
      .test('available', 'not available', checkAssetAvailable),
    destAsset: yup
      .string()
      .required()
      .matches(regexEtherAddress)
      .test('available', 'not available', checkAssetAvailable),
    depositAmount: yup.number().required().min(0),
    acceptAmount: yup.number().required().min(0),
    commissionRate: yup.number().required().min(commissionRate),
    lockWithdrawDuration: yup.number().required().min(0),
  });

const NewOffer: React.FC<NewOfferProps> = ({ domain }) => {
  const { isConnected } = useAccount();

  const { data: commissionRateScale } = useContractRead({
    ...otcContract,
    functionName: 'commissionRateScale',
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema(ethers.BigNumber.from(commissionRateScale).toNumber())),
  });

  const { config } = usePrepareContractWrite({
    ...otcContract,
    functionName: 'createOffer',
    args: [
      domain,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes(Math.random().toString())),
      watch('domainOwner'),
      watch('srcAsset'),
      watch('destAsset'),
      watch('depositAmount'),
      watch('acceptAmount'),
      watch('commissionRate'),
      watch('lockWithdrawDuration'),
    ],
  });

  const { data, write: createOffer } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  if (!isConnected) {
    return (
      <Box>
        <Text>Offer is available from the given domain. Please connect your wallet to proceed.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text>Please create a new offer with the following information.</Text>
      <form onSubmit={handleSubmit(() => createOffer?.())}>
        <FormControl isInvalid={!!errors.domainOwner}>
          <FormLabel>Domain owner</FormLabel>
          <Input {...register('domainOwner')} />
          <FormErrorMessage>{errors.domainOwner?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.srcAsset}>
          <FormLabel>Source asset</FormLabel>
          <Input {...register('srcAsset')} />
          <FormErrorMessage>{errors.srcAsset?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.destAsset}>
          <FormLabel>Destination asset</FormLabel>
          <Input {...register('destAsset')} />
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
        <Button type="submit" disabled={isLoading} loadingText="Create">
          Create
        </Button>
      </form>
    </Box>
  );
};

export default NewOffer;

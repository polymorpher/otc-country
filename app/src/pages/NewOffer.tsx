import React, { useCallback } from 'react'
import { Controller, useForm, type RegisterOptions } from 'react-hook-form'
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  VStack
} from '@chakra-ui/react'
import { readContract } from '@wagmi/core'
import { type Address } from 'abitype'
import { formatEther, isAddress, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import AmountPicker from '~/components/AmountPicker'
import chain from '~/helpers/chain'
import { otcContract } from '~/helpers/contracts'
import useNewOffer from '~/hooks/useNewOffer'
import useToast from '~/hooks/useToast'
import { fmrHr } from '~/helpers/format'

interface NewOfferProps {
  domain: string
  onCreate: () => void
}

const checkAssetAvailable = async (asset: string): Promise<boolean> =>
  await readContract({
    ...otcContract,
    functionName: 'assets',
    args: [asset]
  }).then((res) => !!res)

const defaultValues = {
  domainOwner: '' as Address,
  srcAsset: '' as Address,
  destAsset: '' as Address,
  depositAmount: '',
  acceptAmount: '',
  commissionRate: 0.5,
  lockWithdrawDuration: 6
}

type FormFields = typeof defaultValues

const rules: Record<keyof FormFields, RegisterOptions> = {
  domainOwner: {
    required: 'required',
    validate: { address: (v: string) => isAddress(v) || 'not address format' }
  },
  srcAsset: {
    required: 'required',
    validate: {
      address: (v: string) => isAddress(v) || 'not address format',
      available: async (v: string) => (await checkAssetAvailable(v)) || 'not available'
    }
  },
  destAsset: {
    required: 'required',
    validate: {
      address: (v: string) => isAddress(v) || 'not address format',
      available: async (v: string) => (await checkAssetAvailable(v)) || 'not available'
    }
  },
  depositAmount: {
    required: 'required',
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero'
    }
  },
  acceptAmount: {
    required: 'required',
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero'
    }
  },
  commissionRate: {
    required: true,
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero'
    }
  }
}

const NewOffer: React.FC<NewOfferProps> = ({ domain, onCreate }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setFocus,
    formState: { errors }
  } = useForm({ defaultValues })

  const { isConnected, address } = useAccount()

  const { toastSuccess, toastError } = useToast()

  const { balance, domainPrice, srcBalance, srcDecimals, destDecimals, isCreatingOffer, createOffer } = useNewOffer({
    srcAsset: watch('srcAsset'),
    destAsset: watch('destAsset'),
    domain,
    chainId: chain.id,
    onSuccess: (data) => {
      toastSuccess({
        title: 'Offer has been created',
        txHash: data.transactionHash
      })
    },
    onSettled: (data, err) =>
      err &&
      toastError({
        title: 'Failed to create the offer',
        description: err.details,
        txHash: data?.transactionHash
      })
  })

  const handleOfferSubmit = useCallback(
    (data: FormFields) =>
      createOffer({
        ...data,
        depositAmount: BigInt(data.depositAmount),
        acceptAmount: parseUnits(data.acceptAmount, Number(destDecimals)),
        commissionRate: BigInt(Math.round(data.commissionRate * 1000)),
        lockWithdrawDuration: BigInt(data.lockWithdrawDuration * 3600)
      }).then(onCreate),
    [createOffer, destDecimals, onCreate]
  )

  const commissionRate = Number(watch('commissionRate'))

  if (!isConnected) {
    return (
      <Alert status="info">
        <AlertIcon />
        Please connect your wallet to proceed.
      </Alert>
    )
  }

  return (
    <VStack>
      <Text fontSize="2xl" my="10">
        Choose an available domain for your offer
      </Text>

      {domainPrice !== undefined && (
        <Alert status={balance > domainPrice ? 'info' : 'warning'}>
          <AlertIcon />
          Domain cost: {formatEther(domainPrice)} ONE <br/>
          {balance > domainPrice
            ? 'You will own the domain. Your offer will be hosted there'
            : 'You have insufficient fund'}
        </Alert>
      )}

      <VStack mt={16} onSubmit={handleSubmit(handleOfferSubmit)} as="form" width="full">
        <FormControl isInvalid={!!errors.domainOwner}>
          <FormLabel>Domain owner</FormLabel>
          <Input value={address} disabled {...register('domainOwner', rules.domainOwner)} />
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
                  onChange={(value) => { field.onChange(value.toString()) }}
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
          <HStack align='center'>
            {[0.1, 0.5, 1].map((value, key) => (
              <Button
                key={key}
                colorScheme='teal'
                variant={commissionRate === value ? 'solid' : 'outline'}
                width={24}
                onClick={() => {
                  setValue('commissionRate', value)
                  setFocus('commissionRate')
                }}
              >
                {value}%
              </Button>
            ))}
            <Input
              type="number"
              step="any"
              {...register('commissionRate', {
                ...rules.commissionRate,
                max: {
                  value: 1,
                  message: 'should be less than 1'
                },
                min: {
                  value: 0.1,
                  message: 'should be greater than 0.1'
                }
              })}
            />
          </HStack>
          <FormErrorMessage>
            {errors.commissionRate?.message?.toString()}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.lockWithdrawDuration}>
          <FormLabel>Lock withdraw duration</FormLabel>
          <Controller
            control={control}
            name="lockWithdrawDuration"
            render={({ field }) => (
              <Slider
                min={6}
                max={24 * 7}
                value={field.value}
                my={8}
                onChange={(value) => { field.onChange(value) }}
              >
                <SliderMark value={6} mt={2} ml={-6} w={12}>
                  6 hr
                </SliderMark>
                <SliderMark value={24} mt={2} ml={-6} w={12}>
                  a day
                </SliderMark>
                {[2, 3, 4, 5, 6, 7].map(d => (
                  <SliderMark
                    value={24 * d}
                    mt={2}
                    ml={-8}
                    w={16}
                    key={d}
                  >
                    {d} days
                  </SliderMark>
                ))}
                <SliderMark
                  value={watch('lockWithdrawDuration')}
                  textAlign='center'
                  bg='blue.500'
                  color='white'
                  mt='-10'
                  ml='-12'
                  w='24'
                >
                  {fmrHr(watch('lockWithdrawDuration'))}
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            )}
          />

          <FormErrorMessage>{errors.lockWithdrawDuration?.message?.toString()}</FormErrorMessage>
        </FormControl>
        <Button type="submit" isLoading={isCreatingOffer} loadingText="Create">
          Create
        </Button>
      </VStack>
    </VStack>
  )
}

export default NewOffer

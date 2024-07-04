import React, { useCallback } from 'react'
import { Controller, useForm, type RegisterOptions } from 'react-hook-form'
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
  VStack
} from '@chakra-ui/react'
import { readContract } from '@wagmi/core'
import { type Address } from 'abitype'
import { formatEther, isAddress, parseUnits } from 'viem'
import { useAccount, useContractRead } from 'wagmi'
import AmountPicker from '~/components/AmountPicker'
import AssetSelect from '~/components/AssetSelect'
import chain from '~/helpers/chain'
import { otcContract } from '~/helpers/contracts'
import useNewOffer from '~/hooks/useNewOffer'
import useToast from '~/hooks/useToast'

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
  commissionRate: '',
  lockWithdrawDuration: ''
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
      sameAsSrc: (v: string, values) => values.srcAsset !== v || 'should not be the same as source asset',
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
  },
  lockWithdrawDuration: {
    required: true,
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero'
    }
  }
}

const NewOffer: React.FC<NewOfferProps> = ({ domain, onCreate }) => {
  const { data: commissionRateScale } = useContractRead({
    ...otcContract,
    functionName: 'commissionRateScale'
  })

  const { isConnected, address } = useAccount()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      ...defaultValues,
      domainOwner: address
    }
  })

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
        commissionRate: BigInt(data.commissionRate),
        lockWithdrawDuration: BigInt(data.lockWithdrawDuration)
      }).then(onCreate),
    [createOffer, destDecimals, onCreate]
  )

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
          <Controller
            control={control}
            name="srcAsset"
            rules={rules.srcAsset}
            render={({ field: { onChange, value } }) => (
              <AssetSelect
                value={value}
                onChange={onChange}
              />
            )}
          />
          <FormErrorMessage>{errors.srcAsset?.message?.toString()}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.destAsset}>
          <FormLabel>Destination asset</FormLabel>
          <Controller
            control={control}
            name="destAsset"
            rules={rules.destAsset}
            render={({ field: { onChange, value } }) => (
              <AssetSelect
                value={value}
                onChange={onChange}
              />
            )}
          />
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
          <Input
            {...register('commissionRate', {
              ...rules.commissionRate,
              max: {
                value: Number(commissionRateScale),
                message: `should be less than ${commissionRateScale}`
              }
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
  )
}

export default NewOffer

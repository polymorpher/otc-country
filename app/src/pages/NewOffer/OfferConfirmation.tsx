import React, { useCallback } from 'react'
import {
  useAssets,
  useNewDomain,
  useNewOffer
} from '~/hooks/useNewOfferHooks.js'
import { formatEther, parseUnits } from 'viem'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  VStack,
  Box,
  Text
} from '@chakra-ui/react'
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  type UseFormWatch,
  type UseFormSetFocus,
  type UseFormSetValue,
  type UseFormHandleSubmit
} from 'react-hook-form'
import { fmrHr } from '~/helpers/format.js'
import { type FormFields, rules } from '~/pages/NewOffer/OfferCommon.js'
import useToast from '~/hooks/useToast.js'
import { useAccount } from 'wagmi'
import { VisuallyHidden } from '@chakra-ui/icons'
import { useDebounce } from 'use-debounce'

interface OfferConfirmationProps {
  domain: string
  control: Control<FormFields>
  watch: UseFormWatch<FormFields>
  errors: FieldErrors<FormFields>
  register: UseFormRegister<FormFields>
  setValue: UseFormSetValue<FormFields>
  setFocus: UseFormSetFocus<FormFields>
  handleSubmit: UseFormHandleSubmit<FormFields>
  onPrev: () => any
  onCreate?: () => any
}

const OfferConfirmation: React.FC<OfferConfirmationProps> = ({
  domain: domainState,
  watch,
  onCreate,
  register,
  errors,
  control,
  setFocus,
  setValue,
  handleSubmit
}) => {
  const [domain] = useDebounce(domainState, 300)
  const {
    registerWeb2Domain,
    generateMetadata,
    setDns,
    domainPrice,
    balance,
    domainOwner
  } = useNewDomain(domain)
  const { srcAsset, destDecimals } = useAssets({
    srcAsset: watch('srcAsset'),
    destAsset: watch('destAsset')
  })
  const { isCreatingOffer, createOffer } = useNewOffer({
    srcAsset,
    domain,
    domainPrice
  })
  const { address } = useAccount()
  const { toastError } = useToast()

  const handleOfferSubmit = useCallback(
    async (data: FormFields) => {
      console.log(data)
      const { transactionHash: txHash } = await createOffer({
        ...data,
        depositAmount: BigInt(data.depositAmount),
        acceptAmount: parseUnits(data.acceptAmount, Number(destDecimals)),
        commissionRate: BigInt(Math.round(data.commissionRate * 1000)),
        lockWithdrawDuration: BigInt(data.lockWithdrawDuration * 3600)
      })
      const address = data.domainOwner
      try {
        await registerWeb2Domain(txHash, address, domain)
        await generateMetadata(domain)
        await setDns(txHash, domain)
        onCreate?.()
      } catch (ex: any) {
        toastError({
          title: 'Domain registration error',
          description: ex.toString()
        })
      }
    },
    [
      toastError,
      domain,
      setDns,
      registerWeb2Domain,
      generateMetadata,
      createOffer,
      destDecimals,
      onCreate
    ]
  )
  const handleError = (ex: any) => {
    let message = ''
    for (const [, value] of Object.entries(ex)) {
      message += `${(value as any).message}; `
    }
    console.log(ex)
    toastError({
      title: 'Unexpected Error',
      description: message
    })
  }

  const commissionRate = Number(watch('commissionRate'))

  return (
    <VStack
      // onSubmit={handleSubmit(handleOfferSubmit, handleError)}
      // as="form"
      width="600px"
      spacing={8}
      pl={4}
      pr={4}
    >
      <VisuallyHidden>
        <Input
          hidden
          value={`${address} (YOU)`}
          disabled
          {...register('domainOwner', rules.domainOwner)}
        />
      </VisuallyHidden>
      <FormControl isInvalid={!!errors.commissionRate}>
        <FormLabel>Commission rate</FormLabel>
        <HStack align="center" padding={4}>
          {[0.1, 0.5, 1].map((value, key) => (
            <Button
              key={key}
              colorScheme="teal"
              variant={commissionRate === value ? 'solid' : 'outline'}
              opacity={commissionRate === value ? 1 : 0.5}
              width={24}
              onClick={() => {
                setValue('commissionRate', value)
                setFocus('commissionRate')
              }}
            >
              {value}%
            </Button>
          ))}
          <InputGroup
            opacity={[0.1, 0.5, 1].includes(commissionRate) ? 0.5 : 1}
          >
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
            <InputRightAddon>%</InputRightAddon>
          </InputGroup>
        </HStack>
        <FormErrorMessage>
          {errors.commissionRate?.message?.toString()}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.lockWithdrawDuration}>
        <FormLabel>Lock withdraw duration</FormLabel>
        <Box py={4} px={8}>
          <Controller
            control={control}
            name="lockWithdrawDuration"
            render={({ field }) => (
              <Slider
                min={6}
                max={24 * 7}
                value={field.value}
                my={8}
                onChange={(value) => {
                  field.onChange(value)
                }}
              >
                <SliderMark value={6} mt={2} w={12}>
                  6 hr
                </SliderMark>
                <SliderMark value={24 * 7} mt={2} ml={-12} w={24}>
                  a week
                </SliderMark>
                <SliderMark
                  value={watch('lockWithdrawDuration')}
                  textAlign="center"
                  bg="blue.500"
                  color="white"
                  whiteSpace={'nowrap'}
                  mt="-10"
                  pl={4}
                  pr={4}
                  transform="translateX(-50%)"
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
        </Box>
        <FormErrorMessage>
          {errors.lockWithdrawDuration?.message?.toString()}
        </FormErrorMessage>
      </FormControl>

      <Button
        onClick={() => handleSubmit(handleOfferSubmit, handleError)()}
        isLoading={isCreatingOffer}
        loadingText="Create"
        size="lg"
        isDisabled={domainOwner !== address && balance <= domainPrice}
      >
        Create Offer
      </Button>
    </VStack>
  )
}
export default OfferConfirmation

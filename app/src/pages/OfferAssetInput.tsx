import React from 'react'
import {
  Controller,
  type Control,
  type UseFormWatch,
  type FieldErrors,
  type UseFormRegister
} from 'react-hook-form'
import {
  Alert,
  AlertIcon,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  VStack,
  Text,
  Box
} from '@chakra-ui/react'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import AmountPicker from '~/components/AmountPicker.js'
import AssetSelect from '~/components/AssetSelect.js'
import { useAssets } from '~/hooks/useNewOfferHooks.js'
import useTokenRates from '~/hooks/useTokenRates.js'
import { ASSETS, DEPEGGED } from '~/helpers/assets.js'
import { fmtNum } from '~/helpers/format.js'
import useToast from '~/hooks/useToast.js'
import { type FormFields, rules } from '~/pages/OfferCommon.js'

interface OfferAssetInputProps {
  control: Control<FormFields>
  watch: UseFormWatch<FormFields>
  errors: FieldErrors<FormFields>
  register: UseFormRegister<FormFields>
}

const OfferAssetInput: React.FC<OfferAssetInputProps> = ({
  watch,
  control,
  errors,
  register
}) => {
  const { srcBalance, srcDecimals, destBalance, destDecimals } = useAssets({
    srcAsset: watch('srcAsset'),
    destAsset: watch('destAsset')
  })

  const [srcRate, destRate] = useTokenRates(
    watch('srcAsset'),
    watch('destAsset')
  )

  const depositAmountInBase = Number(
    formatUnits(BigInt(watch('depositAmount')), Number(srcDecimals))
  )

  const exchangeRate =
    (Number(watch('acceptAmount')) * destRate) / (depositAmountInBase * srcRate)

  return (
    <VStack>
      <VStack width="600px">
        <Text
          color={'grey'}
          fontSize={'12px'}
          width={'100%'}
          textAlign={'left'}
        >
          Deposit
        </Text>
        <HStack width="100%">
          <FormControl flex={1} isInvalid={!!errors.depositAmount}>
            <Controller
              control={control}
              name="depositAmount"
              rules={rules.depositAmount}
              render={({ field }) => (
                <AmountPicker
                  onChange={(value) => {
                    field.onChange(value.toString())
                  }}
                  value={field.value}
                  max={srcBalance ?? 0n}
                  decimals={Number(srcDecimals ?? 0)}
                />
              )}
            />
          </FormControl>
          <FormControl flex={2} isInvalid={!!errors.srcAsset}>
            <Controller
              control={control}
              name="srcAsset"
              rules={rules.srcAsset}
              render={({ field: { onChange, value } }) => (
                <AssetSelect
                  value={value}
                  onChange={onChange}
                  list={DEPEGGED.concat(ASSETS)}
                />
              )}
            />
          </FormControl>
        </HStack>
        <HStack justifyContent={'space-between'} width="100%">
          <Box>
            {BigInt(watch('depositAmount')) > srcBalance ? (
              <Text color="red">Exceed the current balance</Text>
            ) : (
              <Text color="green">
                ${fmtNum(depositAmountInBase * srcRate)}
              </Text>
            )}
            <Text color="red">{errors.depositAmount?.message?.toString()}</Text>
          </Box>
          <Box>
            <Text color="green"> value = ${fmtNum(srcRate)}</Text>
            <Text>{errors.srcAsset?.message?.toString()}</Text>
          </Box>
        </HStack>
        <Text
          mt={6}
          color={'grey'}
          fontSize={'12px'}
          width={'100%'}
          textAlign={'left'}
        >
          Accept
        </Text>
        <HStack width="100%">
          <FormControl flex={1} isInvalid={!!errors.acceptAmount}>
            <Input
              width={'10em'}
              mr={2}
              borderRadius={0}
              border={'none'}
              borderBottom={'1px solid'}
              _focus={{ boxShadow: 'none' }}
              {...register('acceptAmount', rules.acceptAmount)}
            />
          </FormControl>
          <FormControl flex={2} isInvalid={!!errors.destAsset}>
            <Controller
              control={control}
              name="destAsset"
              rules={rules.destAsset}
              render={({ field: { onChange, value } }) => (
                <AssetSelect value={value} onChange={onChange} list={ASSETS} />
              )}
            />
          </FormControl>
        </HStack>
        <HStack justifyContent={'space-between'} width="100%">
          <VStack>
            <Text color="green">
              ${fmtNum(Number(watch('acceptAmount')) * destRate)}
            </Text>
            <Text color={'red'}>
              {errors.acceptAmount?.message?.toString()}
            </Text>
          </VStack>
          <VStack>
            <Text color="green">${fmtNum(destRate)}</Text>
            <Text color={'red'}>{errors.destAsset?.message?.toString()}</Text>
          </VStack>
        </HStack>

        <FormControl isInvalid={!!errors.acceptAmount}>
          <FormLabel>Exchange Rate</FormLabel>
          <FormHelperText color="green">
            % {fmtNum(100 * exchangeRate)}
          </FormHelperText>
        </FormControl>

        <Alert status="info">
          <AlertIcon />
          Tips: You can retract the offer at any time after it is created. Other
          people can join your offer by depositing asset there. The domain owner
          earns commission if the offer is accepted by someone (who has to
          deposit).
        </Alert>
      </VStack>
    </VStack>
  )
}

export default OfferAssetInput

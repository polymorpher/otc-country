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
  Input,
  VStack
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
      <VStack mt={16} width="full" spacing={12}>
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
                list={DEPEGGED.concat(ASSETS)}
              />
            )}
          />
          <FormHelperText color="green">${fmtNum(srcRate)}</FormHelperText>
          <FormErrorMessage>
            {errors.srcAsset?.message?.toString()}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.destAsset}>
          <FormLabel>Destination asset</FormLabel>
          <Controller
            control={control}
            name="destAsset"
            rules={rules.destAsset}
            render={({ field: { onChange, value } }) => (
              <AssetSelect value={value} onChange={onChange} list={ASSETS} />
            )}
          />
          <FormHelperText color="green">${fmtNum(destRate)}</FormHelperText>
          <FormErrorMessage>
            {errors.destAsset?.message?.toString()}
          </FormErrorMessage>
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
                  onChange={(value) => {
                    field.onChange(value.toString())
                  }}
                  value={field.value}
                  max={srcBalance}
                  decimals={Number(srcDecimals)}
                />
              )}
            />
            {BigInt(watch('depositAmount')) > srcBalance ? (
              <FormHelperText color="red">
                Exceed the current balance
              </FormHelperText>
            ) : (
              <FormHelperText color="green">
                ${fmtNum(depositAmountInBase * srcRate)}
              </FormHelperText>
            )}
            <FormErrorMessage>
              {errors.depositAmount?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
        )}

        <FormControl isInvalid={!!errors.acceptAmount}>
          <FormLabel>Accept amount</FormLabel>
          <Input {...register('acceptAmount', rules.acceptAmount)} />
          <FormHelperText color="green">
            ${fmtNum(Number(watch('acceptAmount')) * destRate)}
          </FormHelperText>
          <FormErrorMessage>
            {errors.acceptAmount?.message?.toString()}
          </FormErrorMessage>
        </FormControl>

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

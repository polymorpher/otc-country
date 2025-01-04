import React from 'react'
import {
  Controller,
  type Control,
  type UseFormWatch,
  type FieldErrors,
  type UseFormRegister
} from 'react-hook-form'
import {
  UnorderedList,
  ListItem,
  FormControl,
  HStack,
  Input,
  VStack,
  Text,
  Button
} from '@chakra-ui/react'
import AssetSelect from '~/components/AssetSelect.js'
import { useAssets } from '~/hooks/useNewOfferHooks.js'
import useTokenRates from '~/hooks/useTokenRates.js'
import { ASSETS, DEPEGGED } from '~/helpers/assets.js'
import { fmtNum, tryBigInt } from '~/helpers/format.js'
import { type FormFields, rules } from '~/pages/NewOffer/OfferCommon.js'

interface OfferAssetInputProps {
  control: Control<FormFields>
  watch: UseFormWatch<FormFields>
  errors: FieldErrors<FormFields>
  register: UseFormRegister<FormFields>
  onNext: () => any
}

const OfferAssetInput: React.FC<OfferAssetInputProps> = ({
  watch,
  control,
  errors,
  register,
  onNext
}) => {
  const { srcBalance, srcSymbol, destSymbol, srcInfo, destInfo } = useAssets({
    srcAsset: watch('srcAsset'),
    destAsset: watch('destAsset')
  })

  const [srcRate, destRate] = useTokenRates(
    watch('srcAsset'),
    watch('destAsset')
  )

  const exchangeRate =
    (Number(watch('acceptAmount')) * destRate) /
    (Number(watch('depositAmount')) * srcRate)

  return (
    <VStack>
      <VStack width="600px">
        <Text
          color={'grey'}
          fontSize={'12px'}
          width={'100%'}
          textAlign={'left'}
        >
          I would pay
        </Text>
        <HStack width="100%">
          <FormControl flex={1} isInvalid={!!errors.depositAmount}>
            <Input
              width={'10em'}
              mr={2}
              borderRadius={0}
              border={'none'}
              borderBottom={'1px solid'}
              _focus={{ boxShadow: 'none' }}
              {...register('depositAmount', rules.depositAmount)}
            />
            {/* <Controller */}
            {/*  control={control} */}
            {/*  name="depositAmount" */}
            {/*  rules={rules.depositAmount} */}
            {/*  render={({ field }) => ( */}
            {/*    <AmountPicker */}
            {/*      onChange={(value) => { */}
            {/*        field.onChange(value.toString()) */}
            {/*      }} */}
            {/*      value={field.value} */}
            {/*      max={srcBalance ?? 0n} */}
            {/*      decimals={Number(srcDecimals ?? 6)} */}
            {/*    /> */}
            {/*  )} */}
            {/* /> */}
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
        <HStack fontSize={10} justifyContent={'space-between'} width="100%">
          <HStack>
            <Text color="grey">
              ${fmtNum(Number(watch('depositAmount')) * srcRate)}
            </Text>
            {(tryBigInt(watch('depositAmount')) ?? 0n) > srcBalance && (
              <Text color="red">(Insufficient balance)</Text>
            )}
            <Text color="red">{errors.depositAmount?.message?.toString()}</Text>
          </HStack>
          <HStack>
            <Text color="grey">
              {' '}
              1 {srcInfo?.label ?? srcSymbol ?? 'Unit of Asset'} = $
              {fmtNum(srcRate)}
            </Text>
            <Text color={'red'}>{errors.srcAsset?.message?.toString()}</Text>
          </HStack>
        </HStack>
        <Text
          mt={6}
          color={'grey'}
          fontSize={'12px'}
          width={'100%'}
          textAlign={'left'}
        >
          In exchange for
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
        <HStack fontSize={10} justifyContent={'space-between'} width="100%">
          <HStack>
            <Text color="grey">
              ${fmtNum(Number(watch('acceptAmount')) * destRate)}
            </Text>
            <Text color={'red'}>
              {errors.acceptAmount?.message?.toString()}
            </Text>
          </HStack>
          <HStack>
            <Text color="grey">
              {' '}
              1 {destInfo?.label ?? destSymbol ?? 'Unit of Asset'} = $
              {fmtNum(destRate)}
            </Text>
            <Text color={'red'}>{errors.destAsset?.message?.toString()}</Text>
          </HStack>
        </HStack>

        <HStack
          mt={4}
          justifyContent={'space-between'}
          width={'100%'}
          alignItems={'start'}
        >
          <VStack>
            <Text color="grey" width={'100%'} fontSize={10} textAlign={'left'}>
              Effective Rate:{' '}
              <Text display={'inline'} color="black">
                {errors.acceptAmount ? 'N/A' : fmtNum(exchangeRate)}
              </Text>
            </Text>
            <UnorderedList fontSize={10}>
              <ListItem whiteSpace={'nowrap'}>
                You will deposit <b>{srcInfo?.label ?? srcSymbol}</b> into your
                offer{' '}
              </ListItem>
              <ListItem>Offer is retractable at any time </ListItem>
              <ListItem>Others can join your offer </ListItem>
            </UnorderedList>
          </VStack>
          <Button onClick={onNext}>Next</Button>
        </HStack>
      </VStack>
    </VStack>
  )
}

export default OfferAssetInput

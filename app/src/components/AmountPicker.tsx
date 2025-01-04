import React from 'react'
import { Flex, NumberInput, NumberInputField } from '@chakra-ui/react'
import { formatUnits } from 'viem'

import { tryBigInt } from '~/helpers/format.js'

export interface AmountPickerProps {
  max: bigint
  value: string
  decimals: number
  onChange?: (value: any) => void
}

const AmountPicker: React.FC<AmountPickerProps> = ({
  value,
  onChange,
  max,
  decimals
}) => {
  const val = Number(formatUnits(tryBigInt(value) ?? 0n, decimals))

  const maxVal = Number(formatUnits(max, decimals))

  const change = onChange
    ? (value: string | number) => {
        onChange(value)
        // onChange(parseUnits(`${value}`, decimals))
      }
    : undefined

  return (
    <Flex>
      <NumberInput
        maxW="10em"
        mr={2}
        min={0}
        max={maxVal}
        value={val}
        onChange={change}
      >
        <NumberInputField
          _focus={{ boxShadow: 'none' }}
          border={'none'}
          borderRadius={'0'}
          borderBottom={'1px solid'}
        />
      </NumberInput>

      {/* <Slider */}
      {/*  flex="1" */}
      {/*  focusThumbOnChange={false} */}
      {/*  value={maxVal === 0 ? 0 : (val * 100) / maxVal} */}
      {/*  onChange={(value) => { */}
      {/*    change?.(round((maxVal * value) / 100)) */}
      {/*  }} */}
      {/* > */}
      {/*  <SliderMark */}
      {/*    value={maxVal === 0 ? 0 : Math.min((val * 100) / maxVal, 100)} */}
      {/*    textAlign="center" */}
      {/*    bg={val <= maxVal ? 'blue.500' : 'red.500'} */}
      {/*    color="white" */}
      {/*    mt="-6" */}
      {/*    transform="translateX(-50%)" */}
      {/*    px="1" */}
      {/*  > */}
      {/*    {maxVal === 0 ? 0 : Math.round((val * 100) / maxVal)}% */}
      {/*  </SliderMark> */}
      {/*  <SliderMark */}
      {/*    value={100} */}
      {/*    textAlign="center" */}
      {/*    mt="8" */}
      {/*    transform="translateX(-50%)" */}
      {/*  > */}
      {/*    {fmtNum(maxVal)} */}
      {/*  </SliderMark> */}
      {/*  <SliderTrack> */}
      {/*    <SliderFilledTrack bg={val <= maxVal ? 'blue.500' : 'red.500'} /> */}
      {/*  </SliderTrack> */}
      {/*  <SliderThumb /> */}
      {/* </Slider> */}
    </Flex>
  )
}

export default AmountPicker

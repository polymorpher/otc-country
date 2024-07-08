import React, { useEffect, useState } from 'react'
import {
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack
} from '@chakra-ui/react'
import { formatUnits, parseUnits } from 'viem'
import { round } from '~/helpers/mantisa'
import { fmtNum } from '~/helpers/format'

export interface AmountPickerProps {
  max: bigint
  decimals: number
  onChange?: (value: bigint) => void
}

const AmountPicker: React.FC<AmountPickerProps> = ({ onChange, max, decimals }) => {
  const [value, setValue] = useState(0)

  const maxVal = Number(formatUnits(max, decimals))

  useEffect(() => {
    onChange?.(parseUnits(`${value}`, decimals))
  }, [value, decimals, onChange])

  return (
    <Flex>
      <NumberInput
        maxW="10em"
        mr="2rem"
        min={0}
        max={maxVal}
        value={value}
        onChange={(value) => { setValue(Number(value)) }}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      <Slider
        flex="1"
        focusThumbOnChange={false}
        value={maxVal === 0 ? 0 : (value * 100) / maxVal}
        onChange={(value) => { setValue(round((maxVal * value) / 100)) }}
      >
        <SliderMark
          value={maxVal === 0 ? 0 : Math.min((value * 100) / maxVal, 100)}
          textAlign="center"
          bg={value <= maxVal ? 'blue.500' : 'red.500'}
          color="white"
          mt="-6"
          transform="translateX(-50%)"
          px="1"
        >
          {maxVal === 0 ? 0 : Math.round((value * 100) / maxVal)}%
        </SliderMark>
        <SliderMark
          value={100}
          textAlign='center'
          mt='8'
          transform='translateX(-50%)'
        >
          {fmtNum(maxVal)}
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack bg={value <= maxVal ? 'blue.500' : 'red.500'} />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Flex>
  )
}

export default AmountPicker

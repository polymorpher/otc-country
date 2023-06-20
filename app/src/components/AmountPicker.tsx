import React, { useEffect, useState } from 'react';
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
  SliderTrack,
} from '@chakra-ui/react';
import { formatUnits, parseUnits } from 'viem';

export interface AmountPickerProps {
  max: bigint;
  decimals: number;
  onChange: (value: bigint) => void;
}

const AmountPicker: React.FC<AmountPickerProps> = ({ onChange, max, decimals }) => {
  const [value, setValue] = useState(0);

  const maxVal = Number(formatUnits(max, decimals));

  useEffect(() => {
    onChange(parseUnits(`${value}`, decimals));
  }, [value, decimals, onChange]);

  return (
    <Flex>
      <NumberInput
        maxW="100px"
        mr="2rem"
        min={0}
        max={maxVal}
        value={value}
        onChange={(value) => setValue(Number(value))}
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
        value={(value * 100) / maxVal}
        onChange={(value) => setValue((maxVal * value) / 100)}
      >
        <SliderMark
          value={(value * 100) / maxVal}
          textAlign="center"
          bg="blue.500"
          color="white"
          mt="-6"
          ml="-6"
          px="1"
        >
          {((value * 100) / maxVal).toFixed(0)}%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Flex>
  );
};

export default AmountPicker;

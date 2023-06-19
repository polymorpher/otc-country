import React, { useCallback, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react';
import { formatUnits, parseUnits } from 'viem';

interface AmountPopover {
  children: JSX.Element;
  max: bigint;
  decimals: number;
  onOkay: (value: bigint) => void;
}

const AmountPopover: React.FC<AmountPopover> = ({ max, decimals, onOkay, children }) => {
  const [value, setValue] = useState(0);

  const handleOkayClick = useCallback(
    (onClose: VoidFunction) => () => {
      onClose();
      onOkay(parseUnits(`${value}`, decimals));
    },
    [onOkay, value, decimals],
  );

  const maxVal = Number(formatUnits(max, decimals));

  return (
    <Popover>
      {({ onClose }) => (
        <>
          <PopoverTrigger>{children}</PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverHeader>Amount</PopoverHeader>
              <PopoverArrow />
              <PopoverCloseButton />

              <PopoverBody>
                <Flex>
                  <NumberInput
                    maxW="100px"
                    mr="2rem"
                    min={0}
                    max={maxVal}
                    value={value}
                    onChange={(val) => setValue(Number(val))}
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
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Flex>
              </PopoverBody>

              <PopoverFooter textAlign="right">
                <ButtonGroup size="sm">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue" onClick={handleOkayClick(onClose)}>
                    Okay
                  </Button>
                </ButtonGroup>
              </PopoverFooter>
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  );
};

export default AmountPopover;

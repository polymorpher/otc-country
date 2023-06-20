import React, { useCallback, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';
import AmountPicker, { AmountPickerProps } from './AmountPicker';

interface AmountPopover extends AmountPickerProps {
  children: JSX.Element;
  onOkay: (value: bigint) => void;
}

const AmountPopover: React.FC<AmountPopover> = ({ max, decimals, onOkay, children }) => {
  const [value, setValue] = useState(0n);

  const handleOkayClick = useCallback(
    (onClose: VoidFunction) => () => {
      onClose();
      onOkay(value);
    },
    [onOkay, value],
  );

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
                <AmountPicker max={max} decimals={decimals} onChange={setValue} />
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

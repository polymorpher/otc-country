import React, { useCallback, useState } from 'react'
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
  Portal
} from '@chakra-ui/react'
import AmountPicker, { type AmountPickerProps } from './AmountPicker'

interface AmountPopoverProps extends AmountPickerProps {
  children: JSX.Element
  onOkay: (value: bigint) => void
}

const AmountPopover: React.FC<AmountPopoverProps> = ({
  max,
  decimals,
  onOkay,
  children
}) => {
  const [value, setValue] = useState(0n)

  const handleOkayClick = useCallback(
    (onClose: VoidFunction) => () => {
      onClose()
      onOkay(value)
    },
    [onOkay, value]
  )

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
                <AmountPicker
                  value={String(value)}
                  max={max}
                  decimals={decimals}
                  onChange={setValue}
                />
              </PopoverBody>

              <PopoverFooter textAlign="right">
                <ButtonGroup size="sm">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleOkayClick(onClose)}
                    isDisabled={value === 0n}
                  >
                    Okay
                  </Button>
                </ButtonGroup>
              </PopoverFooter>
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  )
}

export default AmountPopover

import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { formatSeconds } from '~/helpers/time';

interface WithdrawProps {
  lockWithdrawUntil: number;
  timestamp: number;
  disabled: boolean;
  isWithdrawing: boolean;
  onClick?: VoidFunction;
}

const Withdraw = React.forwardRef<HTMLButtonElement, WithdrawProps>(
  ({ lockWithdrawUntil, timestamp, disabled, isWithdrawing, onClick }, ref) => (
    <Box>
      {lockWithdrawUntil > timestamp && (
        <>
          <Text textAlign="right">Withdraw locked left</Text>
          <Text>{formatSeconds(lockWithdrawUntil - timestamp)}</Text>
        </>
      )}
      <Button
        ref={ref}
        onClick={onClick}
        isDisabled={disabled || Number(lockWithdrawUntil) > timestamp}
        isLoading={isWithdrawing}
        loadingText="Withdraw"
      >
        Withdraw
      </Button>
    </Box>
  ),
);

Withdraw.displayName = 'Withdraw';

export default Withdraw;

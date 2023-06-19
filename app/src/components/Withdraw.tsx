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

const Withdraw: React.FC<WithdrawProps> = ({ lockWithdrawUntil, timestamp, disabled, isWithdrawing, onClick }) => (
  <Box>
    {lockWithdrawUntil > timestamp && (
      <>
        <Text textAlign="right">Withdraw locked left</Text>
        <Text>{formatSeconds(lockWithdrawUntil - timestamp)}</Text>
      </>
    )}
    <Button
      onClick={onClick}
      isDisabled={disabled || Number(lockWithdrawUntil) > timestamp}
      isLoading={isWithdrawing}
      loadingText="Withdraw"
    >
      Withdraw
    </Button>
  </Box>
);

export default Withdraw;

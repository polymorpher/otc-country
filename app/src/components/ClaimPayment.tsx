import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { formatUnits } from 'viem';

interface ClaimPaymentProps {
  balance: bigint;
  decimals: number;
  onClick: VoidFunction;
  isClaiming: boolean;
  disabled: boolean;
}

const ClaimPayment: React.FC<ClaimPaymentProps> = ({ balance, decimals, onClick, isClaiming, disabled }) => (
  <Box>
    <Text textAlign="right">Payment balance</Text>
    <Text>{formatUnits(balance, decimals)}</Text>
    {balance > 0n && (
      <Button isDisabled={disabled} isLoading={isClaiming} loadingText="Claim payment" onClick={onClick}>
        Claim payment
      </Button>
    )}
  </Box>
);

export default ClaimPayment;

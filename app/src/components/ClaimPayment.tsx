import React from 'react';
import { Button, Text, VStack } from '@chakra-ui/react';
import { formatUnits } from 'viem';
import { round } from '~/helpers/mantisa';

interface ClaimPaymentProps {
  balance: bigint;
  decimals: number;
  onClick: VoidFunction;
  isClaiming: boolean;
  disabled: boolean;
}

const ClaimPayment: React.FC<ClaimPaymentProps> = ({ balance, decimals, onClick, isClaiming, disabled }) => (
  <VStack>
    <Text textAlign="right">Payment balance: {round(formatUnits(balance, decimals))}</Text>
    {balance > 0n && (
      <Button isDisabled={disabled} isLoading={isClaiming} loadingText="Claim payment" onClick={onClick}>
        Claim payment
      </Button>
    )}
  </VStack>
);

export default ClaimPayment;

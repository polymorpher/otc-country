import React from 'react'
import { Image, Box, Text } from '@chakra-ui/react'
import { AssetLookup } from '~/helpers/assets.js'
import Coin, { type CoinProps } from '~/components/Coin.js'
import { formatUnits } from 'viem'
import { fmtNum } from '~/helpers/format.js'
import useTokenRates from '~/hooks/useTokenRates.js'

interface CoinWithAmountProps extends CoinProps {
  amount: bigint
  decimals: number
  stacked?: boolean
  gap?: number
  amountTextSize?: string
  coinTextSize?: string
  noRoundBottom?: boolean
  noRoundTop?: boolean
  noEstimatedDollarValue?: boolean
}

const CoinWithAmount: React.FC<CoinWithAmountProps> = ({
  address,
  label,
  icon,
  amount,
  decimals,
  stacked,
  gap = 2,
  coinTextSize,
  amountTextSize,
  noRoundBottom,
  noRoundTop,
  noEstimatedDollarValue
}) => {
  const [rate] = useTokenRates(address)
  const amountDecimal = formatUnits(amount, decimals)
  const amountFormatted = fmtNum(amountDecimal)
  let borderRadius = '8px'
  if (noRoundTop) {
    borderRadius = '0 0 8px 8px'
  }
  if (noRoundBottom) {
    borderRadius = '8px 8px 0 0 '
  }
  if (noRoundTop && noRoundBottom) {
    borderRadius = '0'
  }
  return (
    <Box
      background={'#eee'}
      paddingY={2}
      paddingX={4}
      borderRadius={borderRadius}
      display={'flex'}
      alignItems={'start'}
      flexDirection={'column'}
    >
      <Box
        width={'100%'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'space-between'}
        flexDirection={stacked ? 'column' : 'row'}
        gap={gap}
      >
        <Text color={'black'} fontSize={amountTextSize}>
          {amountFormatted}
        </Text>
        <Coin size={coinTextSize} address={address} label={label} icon={icon} />
      </Box>
      {!noEstimatedDollarValue && (
        <Text color={'#888'} fontSize={'9px'} mt={2}>
          ${fmtNum(rate * Number(amountDecimal))}
        </Text>
      )}
    </Box>
  )
}

export default CoinWithAmount

import React from 'react'
import { Image, Box } from '@chakra-ui/react'
import { AssetLookup } from '~/helpers/assets.js'
import AddressField from '~/components/AddressField.js'

export interface CoinProps {
  address: string
  label?: string
  icon?: string
  size?: string
  transform?: string
}

const Coin: React.FC<CoinProps> = ({
  address,
  label,
  icon,
  size = '1rem',
  transform
}) => {
  label = label ?? AssetLookup[address]?.label
  icon = icon ?? AssetLookup[address]?.icon
  return (
    <Box
      display={'flex'}
      alignItems={'center'}
      flexWrap={'nowrap'}
      background={'white'}
      paddingX={4}
      paddingY={2}
      borderRadius={'16px'}
      transform={transform}
    >
      <Image src={icon} boxSize={size} mr={2} />
      <AddressField size={size} text={label} shorten>
        {address}
      </AddressField>
    </Box>
  )
}

export default Coin

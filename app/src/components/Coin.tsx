import React from 'react'
import { Image, Box } from '@chakra-ui/react'
import { AssetLookup } from '~/helpers/assets.js'
import AddressField from '~/components/AddressField.js'

export interface CoinProps {
  address: string
  label?: string
  icon?: string
  size?: string
}

const Coin: React.FC<CoinProps> = ({ address, label, icon, size = '1rem' }) => {
  label = label ?? AssetLookup[address]?.label
  icon = icon ?? AssetLookup[address]?.icon
  return (
    <Box display={'flex'} alignItems={'center'} flexWrap={'nowrap'}>
      <Image src={icon} boxSize={size} mr={2} />
      <AddressField size={size} text={label} shorten>
        {address}
      </AddressField>
    </Box>
  )
}

export default Coin

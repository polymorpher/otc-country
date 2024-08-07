import React from 'react'
import { Link, Text, Tooltip, type TextProps } from '@chakra-ui/react'
import { host } from '~/helpers/chain'
import { abbreviateAddress } from '~/helpers/address'

interface AddressFieldProps extends TextProps {
  children: string
  text?: string
  shorten?: number | boolean
}

const AddressField: React.FC<AddressFieldProps> = ({ text, children, shorten }) => (
  <Link href={`https://${host}/address/${children}`} isExternal>
    <Tooltip label={children}>
      <Text>
        {shorten === true ? abbreviateAddress(children) : text ?? children}
      </Text>
    </Tooltip>
  </Link>
)

export default AddressField

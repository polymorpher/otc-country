import React from 'react'
import { Link, Text, Tooltip, type TextProps } from '@chakra-ui/react'
import { host } from '~/helpers/chain'

interface AddressFieldProps extends TextProps {
  children: string
  text?: string
  shorten?: number | boolean
}

const shortenAddress = (address: string, length = 20) =>
  address.slice(0, 2 + Math.floor((length - 5) / 2)).concat('...', address.slice(-Math.floor((length - 5) / 2)))

const AddressField: React.FC<AddressFieldProps> = ({ text, children, shorten }) => (
  <Link href={`https://${host}/address/${children}`} isExternal>
    <Tooltip label={children}>
      <Text>
        {shorten === true
          ? shortenAddress(children, 20)
          : typeof shorten === 'number'
            ? shortenAddress(children, shorten)
            : text ?? children}
      </Text>
    </Tooltip>
  </Link>
)

export default AddressField

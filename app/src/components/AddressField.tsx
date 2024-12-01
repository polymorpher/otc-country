import React from 'react'
import { Link, Text, Tooltip, type TextProps } from '@chakra-ui/react'
import { host } from '~/helpers/link.js'
import { abbreviateAddress } from '~/helpers/format.js'

interface AddressFieldProps extends TextProps {
  children: string
  text?: string
  shorten?: number | boolean
}

const AddressField: React.FC<AddressFieldProps> = ({
  text,
  children,
  shorten
}) => {
  const displayAddr = shorten === true ? abbreviateAddress(children) : children
  return (
    <Link href={`https://${host}/address/${children}`} isExternal>
      <Tooltip label={children}>
        <Text>{text ?? displayAddr}</Text>
      </Tooltip>
    </Link>
  )
}

export default AddressField

import React from 'react'
import {
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Spinner
} from '@chakra-ui/react'
import * as config from '~/helpers/config.js'

interface DomainInputProps {
  onChange: (value: string) => void
  loading: boolean
  value: string
}

const DomainInput: React.FC<DomainInputProps> = ({
  onChange,
  loading,
  value
}) => (
  <InputGroup>
    <Input
      borderRadius={'0'}
      border={'none'}
      borderBottom={'1px solid'}
      value={value}
      placeholder="my-offer"
      onChange={(e) => {
        onChange(e.target.value)
      }}
      mr={4}
    />
    {loading && (
      <InputRightElement right="7.7em">
        <Spinner />
      </InputRightElement>
    )}
    <InputRightAddon>.{config.TLD}</InputRightAddon>
  </InputGroup>
)

export default DomainInput

import React from 'react'
import { Input, InputGroup, InputRightAddon, InputRightElement, Spinner } from '@chakra-ui/react'
import * as CONFIG from '~/helpers/config'

interface DomainInputProps {
  onChange: (value: string) => void
  loading: boolean
  value: string
}

const DomainInput: React.FC<DomainInputProps> = ({ onChange, loading, value }) => (
  <InputGroup>
    <Input value={value} placeholder="my-offer" onChange={(e) => { onChange(e.target.value) }} />
    {loading && (
      <InputRightElement right="7.7em">
        <Spinner />
      </InputRightElement>
    )}
    <InputRightAddon>.{CONFIG.TLD}</InputRightAddon>
  </InputGroup>
)

export default DomainInput

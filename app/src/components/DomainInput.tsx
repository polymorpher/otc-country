import React from 'react'
import { Input, InputGroup, InputRightAddon, InputRightElement, Spinner } from '@chakra-ui/react'

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
    <InputRightAddon>.{import.meta.env.VITE_TLD}</InputRightAddon>
  </InputGroup>
)

export default DomainInput

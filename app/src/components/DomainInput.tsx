import React from 'react'
import { Input, InputGroup, InputProps, InputRightAddon } from '@chakra-ui/react'

interface DomainInputProps {
  onChange: InputProps['onChange']
}

const DomainInput: React.FC<DomainInputProps> = ({ onChange }) => {
  return (
    <InputGroup>
      <Input placeholder='mysite' onChange={onChange} />
      <InputRightAddon>.country.com</InputRightAddon>
    </InputGroup>
  )
}

export default DomainInput

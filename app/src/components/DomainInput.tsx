import React, { useMemo } from 'react'
import { Input, InputGroup, InputRightAddon, InputRightElement, Spinner } from '@chakra-ui/react'
import debounce from 'lodash/debounce'
import { debounceTimeout } from '~/helpers/config'

interface DomainInputProps {
  onChange: (value: string) => void
  loading: boolean
}

const DomainInput: React.FC<DomainInputProps> = ({ onChange, loading }) => {
  const handleDebouncedChange = useMemo(() => debounce((e) => { onChange(e.target.value) }, debounceTimeout), [onChange])

  return (
    <InputGroup>
      <Input placeholder="my-offer" onChange={handleDebouncedChange} />
      {loading && (
        <InputRightElement right="7.7em">
          <Spinner />
        </InputRightElement>
      )}
      <InputRightAddon>.country</InputRightAddon>
    </InputGroup>
  )
}

export default DomainInput

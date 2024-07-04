import React, { useCallback, useMemo } from 'react'
import { Input, InputGroup, InputRightAddon, InputRightElement, Spinner } from '@chakra-ui/react'
import debounce from 'lodash/debounce'
import { debounceTimeout } from '~/helpers/config'

interface DomainInputProps {
  onChange: (value: string) => void
  loading: boolean
  value: string
}

const DomainInput: React.FC<DomainInputProps> = ({ onChange, loading, value }) => {
  // const handleDebouncedChange = useMemo(() => debounce((e) => { onChange(e.target.value) }, debounceTimeout), [onChange])

  return (
    <InputGroup>
      {/* <Input value={value} placeholder="my-offer" onChange={handleDebouncedChange} /> */}
      <Input value={value} placeholder="my-offer" onChange={(e) => { onChange(e.target.value) }} />
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

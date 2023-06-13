import React, { useCallback } from 'react';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/react';
import debounce from 'lodash/debounce';

interface DomainInputProps {
  onChange: (value: string) => void;
}

const DomainInput: React.FC<DomainInputProps> = ({ onChange }) => {
  const debouncedChange = useCallback(
    debounce((e) => onChange(e.target.value), 300),
    [onChange],
  );

  return (
    <InputGroup>
      <Input placeholder=".country.com" onChange={debouncedChange} />
      <InputRightAddon>.country.com</InputRightAddon>
    </InputGroup>
  );
};

export default DomainInput;

import React, { useMemo } from 'react';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/react';
import debounce from 'lodash/debounce';

interface DomainInputProps {
  onChange: (value: string) => void;
}

const DomainInput: React.FC<DomainInputProps> = ({ onChange }) => {
  const handleDebouncedChange = useMemo(() => debounce((e) => onChange(e.target.value), 300), [onChange]);

  return (
    <InputGroup>
      <Input placeholder=".country.com" onChange={handleDebouncedChange} />
      <InputRightAddon>.country.com</InputRightAddon>
    </InputGroup>
  );
};

export default DomainInput;

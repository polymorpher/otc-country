import React from 'react';
import { Spinner } from '@chakra-ui/react';

interface RemoteFieldProps {
  children: React.ReactElement;
  loading: boolean;
}

const RemoteField: React.FC<RemoteFieldProps> = ({ loading, children }) => (loading ? <Spinner /> : children);

export default RemoteField;

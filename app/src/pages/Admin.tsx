import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import debounce from 'lodash/debounce';
import { useContractRead, useContractWrite } from 'wagmi';
import { otcContract } from '~/helpers/contracts';
import useToast from '~/hooks/useToast';

const Admin: React.FC = () => {
  const [asset, setAsset] = useState();

  const { toastSuccess, toastError } = useToast();

  const handleDebouncedChange = useMemo(() => debounce((e) => setAsset(e.target.value), 300), []);

  const {
    data: assetRegistered,
    refetch,
    isLoading: isChecking,
  } = useContractRead({
    ...otcContract,
    functionName: 'assets',
    args: [asset],
    enabled: false,
  });

  const { write: addAsset, isLoading: isAdding } = useContractWrite({
    ...otcContract,
    functionName: 'addAsset',
    onSuccess: () =>
      toastSuccess({
        title: 'Asset has been added',
      }),
    onError: (err) =>
      toastError({
        title: 'Failed to add the asset',
        description: err.message,
      }),
  });

  const { write: removeAsset, isLoading: isRemoving } = useContractWrite({
    ...otcContract,
    functionName: 'removeAsset',
    onSuccess: () =>
      toastSuccess({
        title: 'Asset has been removed',
      }),
    onError: (err) =>
      toastError({
        title: 'Failed to remove the asset',
        description: err.message,
      }),
  });

  useEffect(() => {
    refetch();
  }, [asset]);

  return (
    <VStack>
      <Text>Manage available assets</Text>

      <FormControl>
        <FormLabel>Asset address</FormLabel>
        <InputGroup>
          <Input onChange={handleDebouncedChange} />
          {isChecking && (
            <InputRightElement>
              <Spinner />
            </InputRightElement>
          )}
        </InputGroup>
        <FormHelperText>{assetRegistered ? 'The asset is registered' : 'The asset is not registered'}</FormHelperText>
      </FormControl>

      <HStack>
        <Button
          isDisabled={isChecking || !!assetRegistered}
          isLoading={isAdding}
          loadingText="Add"
          onClick={() =>
            addAsset({
              args: [asset],
            })
          }
        >
          Add
        </Button>
        <Button
          isDisabled={isChecking || !assetRegistered}
          isLoading={isRemoving}
          loadingText="Remove"
          onClick={() =>
            removeAsset({
              args: [asset],
            })
          }
        >
          Remove
        </Button>
      </HStack>
    </VStack>
  );
};

export default Admin;

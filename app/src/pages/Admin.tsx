import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { isAddress } from 'viem';
import { useContractRead } from 'wagmi';
import { debounceTimeout } from '~/helpers/config';
import { otcContract } from '~/helpers/contracts';
import useContractWriteComplete from '~/hooks/useContractWriteComplete';
import useToast from '~/hooks/useToast';

const Admin: React.FC = () => {
  const [asset, setAsset] = useState();

  const inputRef = useRef(null);

  const { toastSuccess, toastError } = useToast();

  const handleDebouncedChange = useMemo(() => debounce((e) => setAsset(e.target.value), debounceTimeout), []);

  const {
    data: assetRegistered,
    refetch,
    isRefetching: isChecking,
  } = useContractRead({
    ...otcContract,
    functionName: 'assets',
    args: [asset],
    enabled: false,
  });

  const { write: addAsset, isLoading: isAdding } = useContractWriteComplete({
    ...otcContract,
    functionName: 'addAsset',
    description: 'Adding asset',
    onSuccess: (data) =>
      toastSuccess({
        title: 'Asset has been added',
        txHash: data.transactionHash,
      }),
    onSettled: (data, err) =>
      err &&
      toastError({
        title: 'Failed to add the asset',
        description: err.details,
        txHash: data?.transactionHash,
      }),
  });

  const { write: removeAsset, isLoading: isRemoving } = useContractWriteComplete({
    ...otcContract,
    functionName: 'removeAsset',
    description: 'Removing asset',
    onSuccess: (data) =>
      toastSuccess({
        title: 'Asset has been removed',
        txHash: data.transactionHash,
      }),
    onSettled: (data, err) =>
      err &&
      toastError({
        title: 'Failed to removed the asset',
        description: err.details,
        txHash: data?.transactionHash,
      }),
  });

  useEffect(() => {
    if (asset && isAddress(asset)) {
      refetch();
    }
  }, [asset, refetch]);

  return (
    <VStack width="full">
      <Text>Manage available assets</Text>

      <FormControl>
        <FormLabel>Asset address</FormLabel>
        <InputGroup>
          <Input onChange={handleDebouncedChange} ref={inputRef} />
          {isChecking && (
            <InputRightElement>
              <Spinner />
            </InputRightElement>
          )}
        </InputGroup>
        {asset && (
          <FormHelperText>
            {!isAddress(asset)
              ? 'incorrect value'
              : assetRegistered
              ? 'The asset is registered'
              : 'The asset is not registered'}
          </FormHelperText>
        )}
      </FormControl>

      <HStack>
        <Button
          isDisabled={isChecking || !!assetRegistered}
          isLoading={isAdding}
          loadingText="Add"
          onClick={() =>
            asset &&
            isAddress(asset) &&
            addAsset?.({
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
            asset &&
            isAddress(asset) &&
            removeAsset?.({
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

import React, { useEffect, useMemo, useState } from 'react'
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
  VStack
} from '@chakra-ui/react'
import debounce from 'lodash/debounce'
import { isAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { debounceTimeout } from '~/helpers/config'
import { otcContract } from '~/helpers/contracts'
import useContractWriteComplete from '~/hooks/useContractWriteComplete'

const Admin: React.FC = () => {
  const [asset, setAsset] = useState<string>()

  const [assetRegistered, setAssetRegistered] = useState<boolean>()

  const handleDebouncedChange = useMemo(() => debounce((e) => { setAsset(e.target.value) }, debounceTimeout), [])

  const { data, refetch, isFetching: isChecking } = useReadContract({
    ...otcContract,
    functionName: 'assets',
    args: [asset]
  })

  useEffect(() => {
    setAssetRegistered(Boolean(data))
  }, [data])

  const { writeAsync: addAsset, status: addStatus } = useContractWriteComplete({
    ...otcContract,
    functionName: 'addAsset'
  })

  const { writeAsync: removeAsset, status: removeStatus } = useContractWriteComplete({
    ...otcContract,
    functionName: 'removeAsset'
  })

  useEffect(() => {
    if (asset && isAddress(asset)) {
      refetch().catch(console.error)
    }
  }, [asset, refetch])

  return (
    <VStack width="full">
      <Text fontSize="2xl" my="5">
        Manage assets here
      </Text>

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
          isLoading={addStatus === 'pending'}
          loadingText="Add"
          onClick={() =>
            asset &&
            isAddress(asset) &&
            addAsset(
              [asset],
              {
                pendingTitle: 'Adding asset',
                successTitle: 'Asset has been added',
                failTitle: 'Failed to add the asset'
              }
            ).then(() => { setAssetRegistered(true) })
          }
        >
          Add
        </Button>
        <Button
          isDisabled={isChecking || !assetRegistered}
          isLoading={removeStatus === 'pending'}
          loadingText="Remove"
          onClick={() =>
            asset &&
            isAddress(asset) &&
            removeAsset(
              [asset],
              {
                pendingTitle: 'Adding asset',
                successTitle: 'Asset has been added',
                failTitle: 'Failed to add the asset'
              }
            ).then(() => { setAssetRegistered(false) })
          }
        >
          Remove
        </Button>
      </HStack>
    </VStack>
  )
}

export default Admin

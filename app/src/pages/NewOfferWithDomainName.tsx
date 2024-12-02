import React, { useState } from 'react'
import {
  Alert,
  AlertIcon,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react'
import { type Address } from 'abitype'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { newName } from '~/helpers/names.js'
import OfferAssetInput from '~/pages/OfferAssetInput.js'
import useShowError from '~/hooks/useShowError.js'
import { useForm } from 'react-hook-form'
import OfferDomainInput from '~/pages/OfferDomainInput.js'
import OfferConfirmation from '~/pages/OfferConfirmation.js'
import { defaultValues } from '~/pages/OfferCommon.js'

const NewOfferWithDomainName = (): React.JSX.Element => {
  const { isConnected, address } = useAccount()
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [offerAddress, setOfferAddress] = useState<Address>()
  const [domain, setDomain] = useState<string>(newName())
  const [error, setError] = useState<any>()

  const showError = useShowError()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setFocus,
    formState: { errors }
  } = useForm({
    defaultValues: {
      ...defaultValues,
      domainOwner: address ?? zeroAddress
    }
  })

  return (
    <VStack width="full" maxW={'container.sm'}>
      <Text fontSize={24} m={8}>
        Create a new offer
      </Text>
      <Tabs>
        <TabList>
          <Tab>Choose asset and amount</Tab>
          <Tab>Choose domain name</Tab>
          <Tab>Confirm</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <OfferAssetInput
              watch={watch}
              control={control}
              errors={errors}
              register={register}
            />
          </TabPanel>
          <TabPanel>
            <OfferDomainInput
              domain={domain}
              setDomain={setDomain}
              isFetching={isFetching}
              setIsFetching={setIsFetching}
              setOfferAddress={setOfferAddress}
              offerAddress={offerAddress}
            />
          </TabPanel>
          <TabPanel>
            <OfferConfirmation
              domain={domain}
              watch={watch}
              register={register}
              errors={errors}
              control={control}
              setFocus={setFocus}
              setValue={setValue}
              handleSubmit={handleSubmit}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* {!isFetching && offerAddress === zeroAddress && isConnected && ( */}
      {/*  // <OfferAssetInput */}
      {/*  //   domain={domain} */}
      {/*  //   onCreate={() => { */}
      {/*  //     refetch(domain) */}
      {/*  //   }} */}
      {/*  // /> */}
      {/* )} */}

      {error && (
        <Alert status="error" wordBreak="break-word">
          <AlertIcon />
          {error.details}
        </Alert>
      )}
    </VStack>
  )
}

export default NewOfferWithDomainName

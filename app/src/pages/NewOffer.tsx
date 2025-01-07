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
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { newName } from '~/helpers/names.js'
import OfferAssetInput from '~/pages/NewOffer/OfferAssetInput.js'
import { useForm } from 'react-hook-form'
import OfferDomainInput from '~/pages/NewOffer/OfferDomainInput.js'
import OfferConfirmation from '~/pages/NewOffer/OfferConfirmation.js'
import { defaultValues } from '~/pages/NewOffer/OfferCommon.js'

const NewOffer = (): React.JSX.Element => {
  const { isConnected, address } = useAccount()

  const [domain, setDomain] = useState<string>(newName())

  const [error, setError] = useState<any>()
  const [tabIndex, setTabIndex] = useState<number>(0)

  // const showError = useShowError()

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
    <VStack width="full">
      <Text fontSize={20} m={8}>
        Create a new offer
      </Text>
      <Tabs
        index={tabIndex}
        onChange={(v) => {
          setTabIndex(v)
        }}
        orientation={'vertical'}
      >
        <TabList gap={'16px'} alignItems={'start'} width={'240px'}>
          <Tab textAlign={'left'}>1. Choose assets</Tab>
          <Tab textAlign={'left'}>2. Pick domain</Tab>
          <Tab textAlign={'left'}>3. Confirm</Tab>
        </TabList>
        <TabPanels>
          <TabPanel display={'flex'} justifyContent={'center'}>
            <OfferAssetInput
              watch={watch}
              control={control}
              errors={errors}
              register={register}
              onNext={() => {
                setTabIndex(1)
              }}
            />
          </TabPanel>
          <TabPanel display={'flex'} justifyContent={'center'}>
            <OfferDomainInput
              domain={domain}
              setDomain={setDomain}
              onPrev={() => {
                setTabIndex(0)
              }}
              onNext={() => {
                setTabIndex(2)
              }}
            />
          </TabPanel>
          <TabPanel display={'flex'} justifyContent={'center'}>
            <OfferConfirmation
              domain={domain}
              watch={watch}
              register={register}
              errors={errors}
              control={control}
              setFocus={setFocus}
              setValue={setValue}
              handleSubmit={handleSubmit}
              onPrev={() => {
                setTabIndex(1)
              }}
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

export default NewOffer

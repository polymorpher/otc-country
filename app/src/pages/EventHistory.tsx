import { FormControl, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import AssetSelect from '~/components/AssetSelect'
import { ASSETS, DEPEGGED } from '~/helpers/assets'

const EventHistory: React.FC = () => {
  const [asset, setAsset] = useState(DEPEGGED[0].value)

  return (
    <VStack w="3xl">
      <Text fontSize={20}>Offer History</Text>
      <FormControl>
        <AssetSelect
          value={asset}
          onChange={setAsset}
          list={DEPEGGED.concat(ASSETS)}
        />
      </FormControl>
    </VStack>
  )
}

export default EventHistory

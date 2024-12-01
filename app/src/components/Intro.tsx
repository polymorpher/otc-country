import React from 'react'
import { Text, VStack } from '@chakra-ui/react'

const Intro = (): React.JSX.Element => {
  return (
    <VStack mt={8} mb={8} alignContent={'center'}>
      <Text fontSize={20}>OTC.COUNTRY - P2P Asset Exchange on Harmony</Text>
      <Text fontSize={12}>
        - Trade token over-the-counter using .country domains
      </Text>
      <Text fontSize={12}>
        - Earn commission with trades on your .country domain
      </Text>
    </VStack>
  )
}

export default Intro

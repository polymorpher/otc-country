import React from 'react'
import { Button, VStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import EventHistory from '~/pages/EventHistory'

const LandingPage = () => (
  <VStack spacing={8} w="100%">
    <Button as={Link} to="/new">Create your offer</Button>
    <EventHistory />
  </VStack>
)

export default LandingPage

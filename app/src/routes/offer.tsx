import React from 'react'
import { useParams } from 'react-router-dom'
import OfferPage from '~/pages/Offer'
import { type Address } from 'abitype'

const Offer: React.FC = () => {
  const { address } = useParams()
  return <OfferPage address={address as Address} />
}

export default Offer

import React from 'react'
import { useParams } from 'react-router-dom'
import OfferPage from '~/pages/Offer'

const Offer: React.FC = () => {
  const { address } = useParams()
  return <OfferPage address={address} />
}

export default Offer

import React from 'react'
import { FiExternalLink } from 'react-icons/fi/index.js'
import { Link, Icon } from '@chakra-ui/react'
import { hashLink } from '~/helpers/link.js'

interface TxHashLinkProps {
  hash: string
}

const TxHashLink: React.FC<TxHashLinkProps> = ({ hash }) => (
  <Link href={hashLink(hash)} isExternal>
    tx hash <Icon as={FiExternalLink} />
  </Link>
)

export default TxHashLink

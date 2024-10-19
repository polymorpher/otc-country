import { GraphQLClient } from 'graphql-request'
import { THEGRAPH } from '~/helpers/config'

const client = new GraphQLClient(THEGRAPH)

export default client

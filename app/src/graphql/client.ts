import { GraphQLClient } from 'graphql-request'
import * as config from '~/helpers/config.js'

const client = new GraphQLClient(config.THEGRAPH)

export default client

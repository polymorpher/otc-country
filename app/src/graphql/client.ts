import { GraphQLClient } from 'graphql-request'

const client = new GraphQLClient(import.meta.env.VITE_THEGRAPH)

export default client

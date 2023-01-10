import { createYoga, createSchema } from 'graphql-yoga'
import { GraphQLError } from 'graphql'
import { createServer } from 'node:http'

const users = [
 { id: '1', login: 'Laurin' },
 { id: '2', login: 'Saihaj' },
 { id: '3', login: 'Dotan' }
]

// Provide your schema
const yoga = createYoga({
 schema: createSchema({
 typeDefs: /* GraphQL */ `
 type User {
 id: ID!
 login: String!
 }
 type Query {
 user(byId: ID!): User!
 }
 `,
 resolvers: {
 Query: {
 user: async (_, args) => {
 const user = users.find((user) => user.id === args.byId)
 if (!user) {
 throw new GraphQLError(`User with id '${args.byId}' not found.`)
 }

 return user
 }
 }
 },
 graphiql: {
  defaultQuery: /* GraphQL */ `
    query {
      user(byId: 1)
    }
  `
}
 })
})

// Start the server and explore http://localhost:4000/graphql
const server = createServer(yoga)
server.listen(4000, () => {
 console.info('Server is running on http://localhost:4000/graphql')
})

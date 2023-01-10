import express from 'express'
import { createYoga, createSchema } from 'graphql-yoga'

const app = express()
const users = [ { id: '1', login: 'alice' }, { id: '2', login: 'bob' } ]
const simpleSchema = createSchema({
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
  }
})

const yoga = createYoga({
  schema: simpleSchema,
  graphiql: {
    defaultQuery: /* GraphQL */ `
      query {
        user(byId: 1) {
          login
        }
      }
    `
  }
})

// Bind GraphQL Yoga to `/graphql` endpoint
app.use('/graphql', yoga)

app.listen(4000, () => {
 console.log('Running a GraphQL API server at http://localhost:4000/graphql')
})
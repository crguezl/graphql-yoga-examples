import { GraphQLServer, PubSub } from 'graphql-yoga'
import { inspect } from 'util'

const ins = x => inspect(x, { depth: null})

const typeDefs = `
  type Query {
    hello(name: String!): String!
  }

  type Counter {
    name: String!
    count: Int!
    countStr: String
  }

  type Subscription {
    counter: Counter!
  }
`
const resolvers = {
  Query: {
    hello: (parent, args, context) => {
      console.log(`Current parent: ${parent} args=${ins(args)}, context keys=${Object.keys(context)}`)
      const {pubsub, countMap}  = context
      const name = args.name;
      let c = countMap.get(name) || 0;
      countMap.set(name, ++c)
      // console.log(`countMap[${name}]= ${countMap.get(name)}`);
      pubsub.publish("greetings", { counter: { name: name, count: countMap.get(name) }})
      return `Hello ${name}`
    },
  },
  Counter: {
    countStr: (parent, args, context) => `parent: ${ins(parent)} args=${ins(args)}, context keys=${Object.keys(context)} countMap=${ins(context.countMap)}`,
  },
  Subscription: {
    counter: {
      subscribe: (parent, args, { pubsub, countMap }) => {
        return pubsub.asyncIterator("greetings")
      },
    }
  },
}

const countMap = new Map();
const pubsub = new PubSub()
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub, countMap } })

server.start(() => console.log('Server is running on localhost:4000'))
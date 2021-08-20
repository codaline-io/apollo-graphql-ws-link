### apollo-graphql-ws-link

Just the graphql-ws ["Client with Apollo Recipe"](https://github.com/enisdenjo/graphql-ws#recipes) as package.

### Install

- run `npm install apollo-graphql-ws-link`
- install peer dependencies `npm run install @apollo/client@^3.4.0 graphql@^15.5.0 graphql-ws@^5.3.0`

### Usage

- import WebSocketLink `import { WebSocketLink } from 'apollo-graphql-ws-link'`
- create new WebSocketLink instance and pass graphql-ws client options `new WebSocketLink({
  url: `ws://localhost:3000/graphql`
})`

#### Example:

```TS
import { ApolloClient, split, createHttpLink } from '@apollo/client'
import { WebSocketLink } from 'apollo-graphql-ws-link'

// create ws link - handling subscriptions
const wsLink = new WebSocketLink({
  url: `ws://localhost:3000/graphql`
})
// create http link - handling mutations and queries
const httpLink = createHttpLink({
  uri: `http://localhost:3000/graphql`
})

// Create client with links
// distinguish between subscriptions, queries and mutations
// ws link should handle subscriptions
// http link should handle mutations and queries
export const client = new ApolloClient({
  link: split(
    ({ query }) => {
      const mainDefinition = getMainDefinition(query)
      // If current operation is a "subscription" -> return true. So ws link handles it, else use http link
      if (mainDefinition.kind === 'OperationDefinition') {
        return mainDefinition.operation === 'subscription'
      } else {
        return false
      }
    },
    wsLink,
    httpLink
  )
})
```
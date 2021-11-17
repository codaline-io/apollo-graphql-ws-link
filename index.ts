import {
  ApolloLink, FetchResult, Observable, Operation
} from '@apollo/client/core'
import { print } from 'graphql'
import { Client, ClientOptions, createClient } from 'graphql-ws'

export class WebSocketLink extends ApolloLink {
  private client: Client

  constructor(options: ClientOptions) {
    super()
    this.client = createClient(options)
  }

  request(operation: Operation): Observable<FetchResult> {
    return new Observable((sink) => this.client.subscribe<FetchResult>(
      { ...operation, query: print(operation.query) },
      {
        next: sink.next.bind(sink),
        complete: sink.complete.bind(sink),
        error: (err) => {
          if (Array.isArray(err)) {
            return sink.error(
              new Error(err.map(({ message }) => message).join(', '))
            )
          }

          if (err instanceof CloseEvent) {
            return sink.error(
              // reason will be available on clean closes
              new Error(`Socket closed with event ${err.code} ${err.reason || ''}`)
            )
          }

          return sink.error(err)
        }
      }
    ))
  }
}

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
            // reason will be available on clean closes
            const error = new Error(`Socket closed with event ${err.code} ${err.reason || ''}`)
            error.name = 'CloseEvent'
            return sink.error(error)
          }

          return sink.error(err)
        }
      }
    ))
  }
}

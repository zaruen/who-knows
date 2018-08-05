import {NgModule} from '@angular/core';
import {HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Apollo, ApolloModule} from 'apollo-angular';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import {WebSocketLink} from 'apollo-link-ws';
import {getOperationAST} from 'graphql';
import { GC_AUTH_TOKEN, GC_ENDPOINT, GC_SUBSCRIPTION_ENDPOINT } from './constants';


@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {

    const token = localStorage.getItem(GC_AUTH_TOKEN);
    const authorization = token ? `Bearer ${token}` : null;
    const headers = new HttpHeaders();
    headers.append('Authorization', authorization);

    const uri = GC_ENDPOINT;
    const http = httpLink.create({ uri });

    const ws = new WebSocketLink({
      uri: GC_SUBSCRIPTION_ENDPOINT,
      options: {
        reconnect: true,
        connectionParams: {
          authToken: localStorage.getItem(GC_AUTH_TOKEN),
        }
      }
    });

    // const middleware = new ApolloLink((operation, forward) => {
    //   const token = localStorage.getItem(GC_AUTH_TOKEN);
    //   if (token) {
    //     operation.setContext({
    //       headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    //     });
    //   }
    //   return forward(operation);
    // });

    // split is used to “route” a request to a specific middleware link
    // It takes three arguments, the first one is a test function returning a boolean, the remaining two are again of type ApolloLink
    // If that boolean is true, the request will be forwarded to the link passed as the second argument. If false, to the third one.
    apollo.create({
      link: ApolloLink.split(
        operation => {
          const operationAST = getOperationAST(operation.query, operation.operationName);
          return !!operationAST && operationAST.operation === 'subscription';
        },
        ws,
        http,
      ),
      cache: new InMemoryCache()
    });
  }
}

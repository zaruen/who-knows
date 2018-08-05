import { Component, OnInit, OnDestroy } from '@angular/core';
import { Link } from '../types';
import { Apollo } from 'apollo-angular';
import { ALL_LINKS_QUERY, AllLinkQueryResponse, NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION } from '../graphql';
import { Subscription } from '../../../node_modules/rxjs';
import { AuthService } from '../auth.service';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.css']
})
export class LinkListComponent implements OnInit, OnDestroy {

  linksToRender: Link[] = [];
  loading = true;
  logged = false;
  subscriptions: Subscription[] = [];

  constructor(private _apollo: Apollo, private _authService: AuthService) { }

  ngOnInit() {
    this._authService.isAuthenticated
      .pipe(distinctUntilChanged()) // Only emit when the current value is different than the last
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated;
      });

    // const querySubscription = this._apollo.watchQuery<AllLinkQueryResponse>({
    //   query: ALL_LINKS_QUERY
    // }).valueChanges.subscribe((response) => {
    //   this.linksToRender = response.data.allLinks;
    //   this.loading = response.data.loading;
    //  });

    const allLinkQuery = this._apollo.watchQuery<AllLinkQueryResponse>({
      query: ALL_LINKS_QUERY
    });

    allLinkQuery
      .subscribeToMore({
        document: NEW_LINKS_SUBSCRIPTION,
        updateQuery: (previous, { subscriptionData }) => {
          const newAllLinks = [
            subscriptionData.data.Link.node,
            ...previous.allLinks
          ];
          return {
            allLinks: newAllLinks
          };
        }
      });

    allLinkQuery.subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
      updateQuery: (previous, { subscriptionData }) => {
        const votedLinkIndex = previous.allLinks.findIndex(l =>
          l.id === subscriptionData.data.Vote.node.link.id);
        const link = subscriptionData.data.Vote.node.link;
        const newAllLinks = previous.allLinks.slice();
        newAllLinks[votedLinkIndex] = link;
        return {
          allLinks: newAllLinks
        };
      }
    });

    const querySubscription = allLinkQuery.valueChanges.subscribe((response) => {
      this.linksToRender = response.data.allLinks;
      this.loading = response.data.loading;
    });

     this.subscriptions = [...this.subscriptions, querySubscription];
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

  updateStoreAfterVote (store, createVote, linkId) {
    const data = store.readQuery({
      query: ALL_LINKS_QUERY
    });

    const votedLink = data.allLinks.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    store.writeQuery({ query: ALL_LINKS_QUERY, data });
  }
}

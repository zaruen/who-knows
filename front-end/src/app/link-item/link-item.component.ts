import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Link } from '../types';
import { timeDifferenceForDate } from '../utils';
import { Subscription } from '../../../node_modules/rxjs';
import { GC_USER_ID } from '../constants';
import { CREATE_VOTE_MUTATION } from '../graphql';
import { Apollo } from '../../../node_modules/apollo-angular';
import { DataProxy } from '../../../node_modules/apollo-cache';
import { FetchResult } from '../../../node_modules/apollo-link';

interface UpdateStoreAfterVoteCallback {
  (proxy: DataProxy, mutationResult: FetchResult, linkId: string);
}

@Component({
  selector: 'app-link-item',
  templateUrl: './link-item.component.html',
  styleUrls: ['./link-item.component.css']
})
export class LinkItemComponent implements OnInit, OnDestroy {
  @Input() link: Link;
  @Input() index = 0;
  @Input() isAuthenticated = false;
  @Input() updateStoreAfterVote: UpdateStoreAfterVoteCallback;

  subscriptions: Subscription[] = [];

  constructor(private _apollo: Apollo) { }

  ngOnInit() {
  }

  voteForLink = async () => {
    const userId = localStorage.getItem(GC_USER_ID);
    const voterIds = this.link.votes.map(vote => vote.user.id);
    if (voterIds.includes(userId)) {
      alert(`User (${userId}) already voted for this link.`);
      return;
    }
    const linkId = this.link.id;

    const mutationSubscription = this._apollo.mutate({
      mutation: CREATE_VOTE_MUTATION,
      variables: {
        userId,
        linkId
      },
      update: (store, { data: { createVote } }) => {
        this.updateStoreAfterVote(store, createVote, linkId);
      }
    })
      .subscribe();

    this.subscriptions = [...this.subscriptions, mutationSubscription];

  }

  humanizeDate(date: string) {
    return timeDifferenceForDate(date);
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}

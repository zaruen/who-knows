import { Component, OnInit } from '@angular/core';
import { CREATE_LINK_MUTATION, CreateLinkMutationResponse, ALL_LINKS_QUERY } from '../graphql';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { GC_USER_ID } from '../constants';

@Component({
  selector: 'app-create-link',
  templateUrl: './create-link.component.html',
  styleUrls: ['./create-link.component.css']
})
export class CreateLinkComponent implements OnInit {
  description = '';
  url = '';

  constructor(private _apollo: Apollo, private _router: Router) { }

  ngOnInit() {
  }

  createLink() {
    const postedById = localStorage.getItem(GC_USER_ID);
    if (!postedById) {
      console.error('No user logged in');
      return;
    }

    const newDescription = this.description;
    const newUrl = this.url;
    this.description = '';
    this.url = '';

    this._apollo.mutate<CreateLinkMutationResponse>({
      mutation: CREATE_LINK_MUTATION,
      variables: {
        description: newDescription,
        url: newUrl,
        postedById
      },
      update: (store, { data: { createLink } }) => {
        const data: any = store.readQuery({
          query: ALL_LINKS_QUERY
        });

        data.allLinks.push(createLink);
        store.writeQuery({ query: ALL_LINKS_QUERY, data });
      },
    }).subscribe((response) => {
      this._router.navigate(['/']);
    }, (error) => {
      console.error(error);
      this.description = newDescription;
      this.url = newUrl;
    });
}
}

import { Component, OnInit } from '@angular/core';
import { Link } from '../types';
import { Apollo } from 'apollo-angular';
import { ALL_LINKS_QUERY, AllLinkQueryResponse } from '../graphql';


@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.css']
})
export class LinkListComponent implements OnInit {

  linksToRender: Link[] = [];
  loading = true;

  constructor(private _apollo: Apollo) { }

  ngOnInit() {
     this._apollo.watchQuery<AllLinkQueryResponse>({
      query: ALL_LINKS_QUERY
    }).valueChanges.subscribe((response) => {
      this.linksToRender = response.data.allLinks;
      this.loading = response.data.loading;
     });
  }
}

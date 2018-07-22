import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { GC_USER_ID, GC_AUTH_TOKEN } from '../constants';
import { CREATE_USER_MUTATION, SIGNIN_USER_MUTATION, CreateUserMutationResponse, SigninUserMutationResponse } from '../graphql';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  login = true; // switch between Login and SignUp
  email = '';
  password = '';
  name = '';

  constructor(private _authService: AuthService, private _apollo: Apollo, private _router: Router) { }

  ngOnInit() {
  }

  confirm() {
    if (this.login) {
      this._apollo.mutate<SigninUserMutationResponse>({
        mutation: SIGNIN_USER_MUTATION,
        variables: {
          email: this.email,
          password: this.password
        }
      }).subscribe((result) => {
        const id = result.data.authenticateUser.id;
        const token = result.data.authenticateUser.token;
        this.saveUserData(id, token);

        this._router.navigate(['/']);

      }, (error) => {
        alert(error);
      });
    } else {
      this._apollo.mutate<CreateUserMutationResponse>({
        mutation: CREATE_USER_MUTATION,
        variables: {
          name: this.name,
          email: this.email,
          password: this.password
        }
      }).subscribe((result) => {
        const id = result.data.authenticateUser.id;
        const token = result.data.authenticateUser.token;
        this.saveUserData(id, token);

        this._router.navigate(['/']);

      }, (error) => {
        alert(error);
      });
    }
  }

  saveUserData(id, token) {
    localStorage.setItem(GC_USER_ID, id);
    localStorage.setItem(GC_AUTH_TOKEN, token);
    this._authService.setUserId(id);
  }
}

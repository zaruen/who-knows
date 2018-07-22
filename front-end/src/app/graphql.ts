import {Link, User} from './types';
import gql from 'graphql-tag';

export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
    }
  }
`;

export interface AllLinkQueryResponse {
  allLinks: Link[];
  loading: boolean;
}

export const CREATE_LINK_MUTATION = gql`
  mutation CreateLinkMutation($description: String!, $url: String!, $postedById: ID!) {
    createLink(
      description: $description,
      url: $url,
      postedById: $postedById,
    ) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
    }
  }
`;

export interface CreateLinkMutationResponse {
  createLink: Link;
  loading: boolean;
}

export const CREATE_USER_MUTATION = gql`
  mutation CreateUserMutation($name: String!, $email: String!, $password: String!) {
    signupUser(
      name: $name,
      email: $email,
      password: $password
    ) {
      id
    }

    authenticateUser(
      email: $email,
      password: $password
    ) {
      token
      id
    }
  }
`;

export interface CreateUserMutationResponse {
  loading: boolean;
  signupUser: User;
  authenticateUser: {
    token: string,
    user?: User
  };
}

export const SIGNIN_USER_MUTATION = gql`
  mutation SigninUserMutation($email: String!, $password: String!) {
    authenticateUser(
      email: $email,
      password: $password
    ) {
      token
      id
    }
  }
`;


export interface SigninUserMutationResponse {
  loading: boolean;
  authenticateUser: {
    token: string,
    user?: User
  };
}

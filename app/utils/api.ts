import axios from 'axios';
import { redirect } from '@remix-run/react';
import { GQL_URL } from './config';
import { store } from '~/store';
import { setUser } from '~/reducers/auth.reducer';


export const api = axios.create({
  baseURL: GQL_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function redirectToAuth() {
  if (typeof window !== 'undefined') {
    if (!window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth';
    }
    // Return a promise that never resolves so nothing downstream sees an error
    return new Promise<never>(() => {});
  } else {
    // On the server, throw a redirect
    throw redirect('/auth');
  }
}

async function handleUnauthorized(originalRequest: any) {
  // Already retried once — don't loop, just redirect silently
  if (originalRequest._retry) return redirectToAuth();
  originalRequest._retry = true;

  try {
    // Attempt to refresh the token using the refresh_token cookie
    const response = await axios.post(
      GQL_URL,
      {
        query: `
          mutation RefreshToken {
            refreshToken {
              token
              user {
                id
                email
                username
                emailVerified
                avatarUrl
              }
            }
          }
        `,
      },
      { withCredentials: true }
    );

    const refreshData = response.data?.data?.refreshToken;
    if (refreshData?.user) {
      // Sync Redux state
      store.dispatch(setUser(refreshData.user));
    }

    // Retry the original request
    return api(originalRequest);
  } catch (error) {
    // Refresh failed or returned error — redirect
    return redirectToAuth();
  }
}

// Response interceptor to handle token refresh
api.interceptors.response.use(
  async (response) => {
    // Check for GraphQL errors that should trigger a refresh
    if (response.data?.errors) {
      const isUnauthenticated = response.data.errors.some(
        (err: any) => err.message === 'Unauthorized' || err.extensions?.code === 'UNAUTHENTICATED'
      );

      if (isUnauthenticated) {
        return handleUnauthorized(response.config);
      }
    }

    // Special case for getCurrentUser returning null unexpectedly
    if (response.data?.data && 'getCurrentUser' in response.data.data && !response.data.data.getCurrentUser) {
       // Only trigger if we aren't already on an auth page
       if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          return handleUnauthorized(response.config);
       }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle standard 401 status codes
    if (error.response?.status === 401) {
      return handleUnauthorized(originalRequest);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper to execute GraphQL queries/mutations
 */
export async function gqlRequest<T = any>(query: string, variables?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
  const response = await api.post('', {
    query,
    variables,
  }, { headers });

  // If we reach here, and there are still errors, they aren't auth-related (or refresh failed)
  if (response.data.errors) {
    const error = response.data.errors[0];
    if (error.message === 'Unauthorized' || error.extensions?.code === 'UNAUTHENTICATED') {
      return redirectToAuth();
    }
    throw new Error(error.message || 'GraphQL Error');
  }

  return response.data.data;
}

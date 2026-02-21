import axios from 'axios';

const GQL_URL = 'http://localhost:3000/graphql';

export const api = axios.create({
  baseURL: GQL_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function redirectToAuth() {
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    window.location.href = '/auth';
  }
  // Return a promise that never resolves so nothing downstream sees an error
  return new Promise<never>(() => {});
}

async function handleUnauthorized(originalRequest: any) {
  // Already retried once — don't loop, just redirect silently
  if (originalRequest._retry) return redirectToAuth();
  originalRequest._retry = true;

  try {
    // Attempt to refresh the token using the refresh_token cookie
    await axios.post(
      GQL_URL,
      {
        query: `
          mutation RefreshToken {
            refreshToken {
              token
            }
          }
        `,
      },
      { withCredentials: true }
    );

    // Retry the original request
    return api(originalRequest);
  } catch {
    // Refresh failed — redirect silently, no error bubble
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
export async function gqlRequest<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const response = await api.post('', {
    query,
    variables,
  });

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

import axios from 'axios';

const GQL_URL = 'http://localhost:3000/graphql';

export const api = axios.create({
  baseURL: GQL_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    // NOTE: NestJS with GraphQL and SignedInGuard might return 401 Unauthorized in extensions or as a status code
    // Depending on the configuration, it might be a normal response with error field.
    // However, if the GUARD throws, it might return 401 status.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        // The server will read the refresh_token from the httpOnly cookie
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
      } catch (refreshError) {
        // If refresh fails, we're definitely not authenticated
        // Redirect to login or clear state
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        return Promise.reject(refreshError);
      }
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

  if (response.data.errors) {
    const error = response.data.errors[0];
    // Check if it's an unauthenticated error specifically in the GraphQL error body
    if (error.message === 'Unauthorized' || error.extensions?.code === 'UNAUTHENTICATED') {
        // Trigger the 401 interceptor manually or handle it here
        // Usually, a 401 status code is better, but if it's 200 with errors:
        throw { response: { status: 401 }, config: { _retry: false } };
    }
    throw new Error(error.message || 'GraphQL Error');
  }

  return response.data.data;
}

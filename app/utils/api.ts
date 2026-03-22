import axios from 'axios';
import { GQL_URL } from './config';
import { store } from '~/store';
import { setUser } from '~/reducers/auth.reducer';
import { redirect } from '@remix-run/router'; // Safe for both browser and node


export const api = axios.create({
  baseURL: GQL_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function redirectToAuth() {
  const loginPath = '/auth';
  if (typeof window !== 'undefined') {
    if (!window.location.pathname.startsWith(loginPath)) {
      window.location.href = loginPath;
    }
    return new Promise<never>(() => {});
  } else {
    // On the server (Remix loader), throw a redirect
    // We use @remix-run/router's redirect which is environment-agnostic
    throw redirect(loginPath);
  }
}

async function handleUnauthorized(originalRequest: any) {
  // console.log("[Auth Flow] handleUnauthorized started for: ", originalRequest || '(base GQL URL)');
  console.log("[Auth Flow] handleUnauthorized started for: ");
  // Already retried once — don't loop, just redirect silently
  if (originalRequest._retry) {
    console.log("[Auth Flow] Request already retried, redirecting to auth...");
    return redirectToAuth();
  }
  originalRequest._retry = true;

  try {
    // console.log("[Auth Flow] Attempting silent refresh via mutation...");
    
    // FOR SERVER-SIDE (SSR): We must forward the original cookies manually
    const headers: Record<string, string> = {};
    const originalCookies = originalRequest.headers?.Cookie || originalRequest.headers?.cookie;
    if (originalCookies) {
      headers.Cookie = originalCookies;
    }

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
      { 
        withCredentials: true,
        headers 
      }
    );

    const refreshData = response.data?.data?.refreshToken;
    // console.log("[API Interceptor] Refresh response data:", JSON.stringify(response.data, null, 2));
    
    if (refreshData?.user) {
      // Sync Redux state (client-side only)
      store.dispatch(setUser(refreshData.user));
    }

    // Forward the new cookies from the refresh response to the retry request.
    // In the browser, `withCredentials: true` handles this automatically via
    // the browser's cookie jar. During SSR, there's no cookie jar — so we must
    // manually extract `Set-Cookie` headers and forward them as `Cookie`.
    const setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders && typeof window === 'undefined') {
      // Build a fresh Cookie header from the Set-Cookie values
      const cookieStr = (Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders])
        .map((sc: string) => sc.split(';')[0]) // extract "name=value" from each Set-Cookie
        .join('; ');
      
      // Merge with any existing cookies that weren't refreshed
      const existingCookies = originalRequest.headers?.Cookie || originalRequest.headers?.cookie || '';
      const existingMap = new Map(
        existingCookies.split('; ').filter(Boolean).map((c: string) => {
          const [key, ...v] = c.split('=');
          return [key, v.join('=')] as [string, string];
        })
      );
      let newAccessToken = '';
      // Overwrite with fresh cookies from the refresh response
      cookieStr.split('; ').forEach((c: string) => {
        const [key, ...v] = c.split('=');
        existingMap.set(key, v.join('='));
        if (key === 'access_token') {
          newAccessToken = v.join('=');
        }
      });
      const mergedCookies = Array.from(existingMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
      
      if (!originalRequest.headers) originalRequest.headers = {};
      originalRequest.headers.Cookie = mergedCookies;

      if (originalRequest.headers.Authorization && newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
    }

    // Retry the original request.
    // axios serializes config.data to a JSON string after the first request,
    // so we must parse it back before retrying to avoid double-serialization.
    if (typeof originalRequest.data === 'string') {
      try {
        originalRequest.data = JSON.parse(originalRequest.data);
      } catch (_) {
        // not JSON, leave as-is
      }
    }
    return api(originalRequest);
  } catch (error) {
    // Refresh failed or returned error — redirect
    return redirectToAuth();
  }
}

// Response interceptor to handle token refresh
api.interceptors.response.use(
  async (response) => {
    // console.log("[API DEBUG] Recieived response from:", response.config.baseURL);
    // Check for GraphQL errors that should trigger a refresh
    if (response.data?.errors) {
      // console.log("[API Interceptor] Errors detected in response:", JSON.stringify(response.data.errors, null, 2));
      
      console.log("response data errors is ", response.data.errors);
      const isUnauthenticated = response.data.errors.some(
        (err: any) => 
          err.message === 'Unauthorized' || 
          err.message === 'User not authenticated' ||
          err.extensions?.code === 'UNAUTHENTICATED' ||
          err.extensions?.errorCode === 'UNAUTHENTICATED'
      );

      if (isUnauthenticated) {
        console.log("[API Interceptor] Unauthenticated state detected, proceeding to refresh...");
        return handleUnauthorized(response.config);
      }
    }

    // Special case for getCurrentUser returning null unexpectedly
    if (response.data?.data && 'getCurrentUser' in response.data.data && response.data.data.getCurrentUser === null) {
      //  console.log("[API Interceptor] getCurrentUser returned null. Checking if we should refresh...");
      // console.log("response data data is ", response.data?.data);
      
      // On client, don't refresh if we are already on auth page
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth')) {
        return response;
      }
      
      //  console.log("[API Interceptor] Triggering silent refresh for null user...");
       return handleUnauthorized(response.config);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error("=================an error occurred in the response interceptor");
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
  console.log("[gqlRequest] Executing query...", query);
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

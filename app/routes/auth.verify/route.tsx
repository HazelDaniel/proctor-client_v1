import {
  ClientLoaderFunctionArgs,
  json,
  redirect,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { toast } from "sonner";
import { setUser } from "~/reducers/auth.reducer";
import { gqlRequest, api } from "~/utils/api";
import { Logo } from "~/components/logo";
import { store } from "~/store";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    return json({ error: "Invalid verification link. Missing token or email." });
  }

  const cookieHeader = request.headers.get("Cookie");
  let headers: Record<string, string> | undefined = undefined;
  
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, decodeURIComponent(v.join('='))];
      })
    );
    if (cookies.access_token) {
      headers = {
        Authorization: `Bearer ${cookies.access_token}`,
        Cookie: cookieHeader
      };
    } else {
      headers = { Cookie: cookieHeader };
    }
  }

  // Read rememberMe from cookie (set by the /auth page before submit).
  // Cookies are available during SSR, unlike localStorage.
  let rememberMe = true;
  if (cookieHeader) {
    const rmCookie = cookieHeader.split('; ').find(c => c.startsWith('proctor_remember_me='));
    if (rmCookie) {
      rememberMe = rmCookie.split('=')[1] !== 'false';
    }
  }

  try {
    // We need the raw response to extract Set-Cookie headers from the backend
    const response = await api.post('', {
      query: `
        mutation VerifyLogin($email: String!, $token: String!, $rememberMe: Boolean) {
          verifyLogin(email: $email, token: $token, rememberMe: $rememberMe) {
            user {
              id
              email
              username
              emailVerified
              avatarUrl
            }
            token
          }
        }
      `,
      variables: { email, token, rememberMe }
    }, { headers });

    // Extract the Set-Cookie headers from the GraphQL backend response
    const setCookieHeaders = response.headers['set-cookie'];
    const redirectHeaders = new Headers();
    
    if (setCookieHeaders) {
      if (Array.isArray(setCookieHeaders)) {
        setCookieHeaders.forEach(cookie => {
          redirectHeaders.append('Set-Cookie', cookie);
        });
      } else {
        redirectHeaders.append('Set-Cookie', setCookieHeaders);
      }
    }

    // Redirect to files on success, passing along the cookies
    return redirect("/files", {
      headers: redirectHeaders
    });
  } catch (err: any) {
    if (err.response?.data?.errors) {
       console.error("Verification failed:", err.response.data.errors);
       err = new Error(err.response.data.errors[0]?.message || 'Verification failed');
    } else {
       console.error("Verification failed:", err);
    }

    // If the token is invalid/expired, but the user is actually already logged in
    // via their cookies, we should just let them in.
    if (err.message && (err.message.includes("Invalid or expired") || err.message.includes("token expired"))) {
      try {
        const currentUserData = await gqlRequest(`
          query GetCurrentUser { 
            getCurrentUser { 
              id 
              email 
              username 
              emailVerified
              avatarUrl 
            } 
          }
        `, undefined, headers);
        if (currentUserData.getCurrentUser) {
          // Send user data down so clientLoader can dispatch it
          return redirect("/files");
        }
      } catch (checkErr) {
        // If gqlRequest fails with UNAUTHENTICATED, it will redirect to /auth automatically.
        // If it throws another error, ignore it and fall through to show the verification failed screen.
      }
    }

    return json({ error: err.message || "Verification failed" });
  }
};

export const clientLoader = async ({ serverLoader }: ClientLoaderFunctionArgs) => {
  // If we redirected, serverLoader won't return data it will just redirect, 
  // but if we fell through to an error, we return the error.
  const data = await serverLoader();
  
  // Cleanup
  try {
     localStorage.removeItem("proctor_remember_me");
  } catch(e) {}
  
  // We can't dispatch user here easily without modifying the redirect response, 
  // but the /files loader will fetch the user anyway upon redirect.
  
  return data;
};
clientLoader.hydrate = true;

export default function VerifyPage() {
  const loaderData = useLoaderData<typeof loader>() as { error?: string } | null;
  const navigate = useNavigate();

  // If we have an error, show it. Otherwise, we're loading (since clientLoader handles redirect on success)
  const errorMessage =
    loaderData && typeof loaderData === 'object' && "error" in loaderData ? loaderData.error : null;

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);


  return (
    <section className="flex flex-col items-center justify-center w-full h-screen bg-canvas p-8 text-center">
      <div className="w-16 h-16 mb-8">
        <Logo />
      </div>

      {!errorMessage && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Verifying your login...</h2>
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
        </>
      )}

      {errorMessage && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Verification failed</h2>
          <p className="text-secondaryText mb-8">{errorMessage}</p>
          <button
            onClick={() => navigate("/auth")}
            className="rounded-full px-8 py-3 bg-fg text-canvas"
          >
            Go back to sign in
          </button>
        </>
      )}

    </section>
  );
}

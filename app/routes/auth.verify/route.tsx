import {
  ClientLoaderFunctionArgs,
  json,
  redirect,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { setUser } from "~/reducers/auth.reducer";
import { gqlRequest } from "~/utils/api.client";
import { Logo } from "~/components/logo";
import { store } from "~/store";

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    return json({ error: "Invalid verification link. Missing token or email." });
  }

  // Get rememberMe preference from localStorage (set in /auth route)
  let rememberMe = false;
  try {
    const stored = localStorage.getItem("proctor_remember_me");
    rememberMe = stored === "true";
  } catch (e) {
    console.warn("Failed to read rememberMe from localStorage", e);
  }

  try {
    const data = await gqlRequest(
      `
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
      { email, token, rememberMe }
    );

    // Update global state
    store.dispatch(setUser(data.verifyLogin.user));

    // Cleanup
    localStorage.removeItem("proctor_remember_me");

    // Redirect to files on success
    return redirect("/files");
  } catch (err: any) {
    console.error("Verification failed:", err);
    return json({ error: err.message || "Verification failed" });
  }
};

export default function VerifyPage() {
  const loaderData = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  // If we have an error, show it. Otherwise, we're loading (since clientLoader handles redirect on success)
  const errorMessage =
    loaderData && "error" in loaderData ? loaderData.error : null;


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

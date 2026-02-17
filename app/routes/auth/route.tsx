import { Link, useSearchParams } from "@remix-run/react";

import { Logo } from "~/components/logo";
import { useState } from "react";
import { gqlRequest } from "~/utils/api.client";
import { Checkbox } from "~/components/ui/checkbox";

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "signin" ? "signin" : "signup";
  const isSignUp = mode === "signup";

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleRequestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await gqlRequest(`
        mutation RequestLogin($email: String!, $username: String) {
          requestLogin(email: $email, username: $username)
        }
      `, { email, username: isSignUp ? username : undefined });
      
      // Persist rememberMe preference for the verification step
      localStorage.setItem("proctor_remember_me", String(rememberMe));
      
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to request login");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <section className="flex flex-col items-center justify-center w-full h-screen bg-canvas p-8 text-center">
        <div className="w-16 h-16 mb-8">
          <Logo />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Check your email</h2>
        <p className="text-secondaryText max-w-md">
          We've sent a magic login link to <strong>{email}</strong>. 
          Please check your inbox (and spam folder) to continue.
        </p>
        <button 
          onClick={() => setSent(false)} 
          className="mt-8 text-accent underline"
        >
          Back to {isSignUp ? "sign up" : "sign in"}
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center lg:flex-row w-[100vw] h-[68rem] min-h-[100vh] relative overflow-hidden">
      <div className="bg-auth-bg-mobile lg:bg-auth-bg-desktop absolute lg:relative w-full h-full md:h-full left-0 bg-[cover] z-2 block lg:mt-0"></div>
      <div className="z-5 w-full h-[65rem] bg-canvas rounded-2xl relative p-8 flex flex-col justify-start items-center max-w-[70rem] md:max-w-[100vw]">
        <div
          className="w-16 h-16 md:h-[3rem] self-start md:self-center md:scale-90 mb-8"
          style={{ "--logo-box-here": "100%" } as any}
        >
          <Logo />
        </div>

        <h2 className="mb-[60px] text-2xl font-semibold text-secondaryText">
          {isSignUp ? "Sign up for Proctor" : "Sign in to Proctor"}
        </h2>
        
        <form onSubmit={handleRequestLogin} className="flex flex-col w-[90%] md:w-[80%] h-max">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-16 md:h-[3rem] w-full rounded-full ring-1 mb-4 bg-outline1/20 focus:outline-none focus:rounded-sm px-8 placeholder:text-secondaryText/50 ring-outline1 text-secondaryText text-md"
            placeholder="Email address"
          />

          {isSignUp && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-16 md:h-[3rem] w-full rounded-full ring-1 mb-4 bg-outline1/20 focus:outline-none focus:rounded-sm px-8 placeholder:text-secondaryText/50 ring-outline1 text-secondaryText text-md"
              placeholder="Username"
            />
          )}

          <div className="flex items-center space-x-3 mb-6 px-4 mt-4">
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe} 
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              className="border-outline1"
            />
            <label
              htmlFor="rememberMe"
              className="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-secondaryText/80 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-full h-16 md:h-[3rem] bg-fg text-canvas text-lg uppercase mb-8 disabled:opacity-50"
          >
            {loading
              ? "Sending link..."
              : isSignUp
                ? "Create Account"
                : "Send Magic Link"}
          </button>

          <div className="flex justify-center items-center mt-4">
            <span className="flex-1 h-1 bg-outline1 rounded mr-4"></span>
            <p className="text-outline1d text-md font-medium">social login (coming soon)</p>
            <span className="flex-1 h-1 bg-outline1 rounded ml-4"></span>
          </div>

          <ul className="w-full h-max flex gap-4 justify-center mt-2 mb-8 opacity-50 pointer-events-none">
            {/* Social icons removed for brevity, keeping only visual structure */}
            <li className="w-8 h-8 bg-outline1 rounded-full"></li>
            <li className="w-8 h-8 bg-outline1 rounded-full"></li>
            <li className="w-8 h-8 bg-outline1 rounded-full"></li>
          </ul>

          <div className="flex w-[90%] justify-between mx-auto h-max mb-16">
            <p className="text-lg text-outline1d md:text-md">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Link
              to={isSignUp ? "/auth?mode=signin" : "/auth?mode=signup"}
              className="underline underline-offset-4 text-lg md:text-md font-semibold text-accent"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};


export default AuthPage;

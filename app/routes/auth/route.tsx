import { ClientLoaderFunctionArgs, Form, Link } from "@remix-run/react";
import { Link as LinkIcon } from "lucide-react";
import { Logo } from "~/components/logo";

export const clientLoader = (args: ClientLoaderFunctionArgs) => {
  return {};
};

export const AuthPage: React.FC = () => {
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
          Sign in to proctor
        </h2>
        <Form className="flex flex-col w-[90%] md:w-[80%] h-max">
          <input
            type="email"
            className="h-16 md:h-[3rem] w-full rounded-full ring-1 mb-8 bg-outline1/20 focus:outline-none focus:rounded-sm px-8 placeholder:text-secondaryText/50 ring-outline1 text-secondaryText text-md"
            placeholder="email"
          />

          <div className="relative h-16 md:h-[3rem] w-full">
            <input
              type="password"
              className="h-16 md:h-[3rem] w-full rounded-full ring-1 mb-8 bg-outline1/20 focus:outline-none focus:rounded-sm px-8 placeholder:text-secondaryText/50 ring-outline1 text-secondaryText peer/passwordField text-md"
              placeholder="password"
            />

            <span className="y-centered-absolute right-4 w-8 h-8 flex items-center justify-center peer-focus/passwordField:opacity-0 transition-opacity duration-500">
              <svg className="w-full h-full">
                <use xlinkHref="#eye"></use>
              </svg>
            </span>

            <span className="y-centered-absolute right-4 w-8 h-8 flex items-center justify-center opacity-0 peer-focus/passwordField:opacity-100 transition-opacity duration-500">
              <svg className="w-full h-full">
                <use xlinkHref="#eye-slashed"></use>
              </svg>
            </span>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 flex items-center">
              <input
                type="checkbox"
                name=""
                id="remember-me"
                className="mr-4 accent-outline1d h-full"
              />
              <label
                htmlFor="remember-me"
                className="capitalize text-outline1d text-md h-full flex flex-col justify-center"
              >
                remember me
              </label>
            </div>
            <Link className="underline" to={""}>
              forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="mt-4 rounded-full h-16 md:h-[3rem] bg-fg text-canvas text-lg uppercase mb-8"
          >
            sign in
          </button>

          <div className="flex justify-center items-center mt-4">
            <span className="flex-1 h-1 bg-outline1 rounded mr-4"></span>
            <p className="text-outline1d text-md font-medium">or login using</p>
            <span className="flex-1 h-1 bg-outline1 rounded ml-4"></span>
          </div>

          <ul className="w-full h-max flex gap-4 justify-center mt-2 mb-8">
            <li className="w-8 h-8">
              <Link
                to={""}
                className="w-full h-full flex items-center justify-center"
              >
                <svg className="w-full h-full">
                  <use xlinkHref="#google"></use>
                </svg>
              </Link>
            </li>

            <li className="w-8 h-8">
              <Link
                to={""}
                className="w-full h-full flex items-center justify-center"
              >
                <svg className="w-full h-full">
                  <use xlinkHref="#meta"></use>
                </svg>
              </Link>
            </li>

            <li className="w-8 h-8">
              <Link
                to={""}
                className="w-full h-full flex items-center justify-center"
              >
                <svg className="w-full h-full">
                  <use xlinkHref="#linkedin"></use>
                </svg>
              </Link>
            </li>

            <li className="w-8 h-8">
              <Link
                to={""}
                className="w-full h-full flex items-center justify-center"
              >
                <svg className="w-full h-full">
                  <use xlinkHref="#github"></use>
                </svg>
              </Link>
            </li>
          </ul>

          <div className="flex w-[90%] justify-between mx-auto h-max mb-16">
            <p className="text-lg text-outline1d md:text-md">
              Don't have an account?
            </p>{" "}
            <span>
              <Link
                to={""}
                className="underline underline-offset-4 text-lg md:text-md font-semibold text-accent"
              >
                sign up
              </Link>
            </span>
          </div>
        </Form>
      </div>
    </section>
  );
};

export default AuthPage;

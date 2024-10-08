import { ClientLoaderFunctionArgs } from "@remix-run/react";
import { Logo } from "~/components/logo";

export const clientLoader = (args: ClientLoaderFunctionArgs) => {
  return {};
};

export const AuthPage: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center lg:flex-row w-[100vw] h-max min-h-[100vh] relative">
      <div className="bg-auth-bg-mobile lg:bg-auth-bg-desktop absolute lg:relative w-full h-[100vh] top-0 left-0 bg-cover z-2 block"></div>
      <div className="z-5 w-full h-[80vh] md:h-[100vh] bg-canvas rounded-2xl relative p-8 flex flex-col justify-start items-center max-w-[70rem] md:max-w-[100vw]">
        <div
          className="w-16 h-16 self-start md:self-center md:scale-90 mb-8"
          style={{ "--logo-box-here": "100%" } as any}
        >
          <Logo />
        </div>

        <h2 className="mb-8 text-2xl font-semibold text-secondaryText">
          Sign in to proctor
        </h2>
      </div>
    </section>
  );
};

export default AuthPage;

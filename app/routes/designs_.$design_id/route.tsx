import { ClientLoaderFunctionArgs, json } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { FilesHeader } from "~/components/files-header";
import useEventListener from "~/hooks/useevent";
import { useState } from "react";
import { WorkspaceHeader } from "~/components/workspace-header";

export const meta: MetaFunction = () => {
  return [
    { title: "design | proctor" },
    { name: "description", content: "proctor design file" },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return json({});
};

export const DesignsPage: React.FC = () => {
  const [windowSize, setWindowSize] = useState<number>(window.innerWidth);

  const handleResize = () => {
    setWindowSize(window.innerWidth);
  };

  useEventListener("resize", handleResize, window as HTMLElement | any);

  return (
    <>
      <WorkspaceHeader />
      <section className="designs-section flex-1 w-full basis-auto min-h-[100vh] h-max md:mt-20 mt-32 overflow-hidden">
        <img
          src="/icons/canvas-bg.svg"
          alt="the background image of a design canvas"
          className="top-0 left-0 w-full h-full bg-repeat bg-full scale-3x md:scale-2x bg-fixed fixed"
        />
      </section>
    </>
  );
};

export default DesignsPage;

import { ClientLoaderFunctionArgs, Link, json } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import useEventListener from "~/hooks/useevent";
import { useState } from "react";
import { WorkspaceHeader } from "~/components/workspace-header";
import { WorkspaceSidetab } from "~/components/workspace-sidetab";

export const meta: MetaFunction = () => {
  return [
    { title: "design | proctor" },
    { name: "description", content: "proctor design file" },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return json({});
};

const DesignPanel: React.FC = () => {
  return null;
  return (
    <div className="design-panel w-max min-w-[25rem] md:min-w-[35rem] h-32 align-center mt-32 relative z-10 mx-auto flex px-8 border-r-[18px] border-l-[18px] md:border-r-[20px] md:border-l-[20px] border-accent rounded-lg bg-canvas shadow-md drop-shadow-md shadow-outline1 py-4">
      <div className="h-full mx-auto bg-outline1/35 w-[8rem] flex flex-col relative items-center justify-end overflow-hidden group/folder-pane-g cursor-pointer *:select-none">
        <img
          src="/icons/shadow-file-bottom.svg"
          alt="icon of a stacked folder"
          className="absolute w-[85%] bottom-[-40%] transition-all group-hover/folder-pane-g:bottom-[-10%] group-hover/folder-pane-g:rotate-[-2deg] origin-bottom ease-in-out"
        />
        <img
          src="/icons/shadow-file-top.svg"
          alt=""
          className="absolute w-[85%] bottom-[-20%] transition-all group-hover/folder-pane-g:bottom-[-10%] group-hover/folder-pane-g:rotate-2 origin-bottom"
        />
      </div>
      <span className="h-full w-[2px] bg-outline1 rounded mx-[2rem]"></span>
      <ul className="h-full w-max mx-auto flex flex-row items-center gap-4">
        <li className="w-16 h-16 flex items-center justify-center p-2 rounded-md ring-outline1/35 ring-2 cursor-pointer">
          <div className="w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative">
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#t"></use>
            </svg>
          </div>
        </li>

        <li className="w-16 h-16 flex items-center justify-center p-2 rounded-md ring-outline1/35 ring-2 cursor-pointer">
          <div className="w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative">
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#grid"></use>
            </svg>
          </div>
        </li>

        <li className="w-16 h-16 flex items-center justify-center p-2 rounded-md ring-outline1/35 ring-2 cursor-pointer">
          <div className="w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative">
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#comment"></use>
            </svg>
          </div>
        </li>
      </ul>
    </div>
  );
};

const CommentBoard: React.FC = () => {
  return (
    <div className="fixed top-[10rem] md:top-32 right-0 w-[25rem] h-[20rem] flex shadow-lg shadow-outline1/25">
      <ul className="h-full flex-1 flex-col overflow-auto no-scrollbar">
        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="w-full h-1/2 relative flex justify-end">
            <Link
              to={""}
              className="absolute left-0 w-full h-full top-0 text-accent/75 font-semibold"
            >
              chat #12041
            </Link>
            <span className="h-4 w-4">
              <svg className="h-full w-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex gap-1 flex-1 w-full">
            <img
              src="/public/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/public/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="justify-self-end ml-auto text-outline1 text-sm h-full flex items-center justify-center">
              Thur, 11:02 am
            </span>
          </div>
        </li>

        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="w-full h-1/2 relative flex justify-end">
            <Link
              to={""}
              className="absolute left-0 w-full h-full top-0 text-accent/75 font-semibold"
            >
              chat #12041
            </Link>
            <span className="h-4 w-4">
              <svg className="h-full w-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex gap-1 flex-1 w-full">
            <img
              src="/public/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/public/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="justify-self-end ml-auto text-outline1 text-sm h-full flex items-center justify-center">
              Thur, 11:02 am
            </span>
          </div>
        </li>

        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="w-full h-1/2 relative flex justify-end">
            <Link
              to={""}
              className="absolute left-0 w-full h-full top-0 text-accent/75 font-semibold"
            >
              chat #12041
            </Link>
            <span className="h-4 w-4">
              <svg className="h-full w-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex gap-1 flex-1 w-full">
            <img
              src="/public/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/public/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="justify-self-end ml-auto text-outline1 text-sm h-full flex items-center justify-center">
              Thur, 11:02 am
            </span>
          </div>
        </li>

        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="w-full h-1/2 relative flex justify-end">
            <Link
              to={""}
              className="absolute left-0 w-full h-full top-0 text-accent/75 font-semibold"
            >
              chat #12041
            </Link>
            <span className="h-4 w-4">
              <svg className="h-full w-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex gap-1 flex-1 w-full">
            <img
              src="/public/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/public/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="justify-self-end ml-auto text-outline1 text-sm h-full flex items-center justify-center">
              Thur, 11:02 am
            </span>
          </div>
        </li>

        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="w-full h-1/2 relative flex justify-end">
            <Link
              to={""}
              className="absolute left-0 w-full h-full top-0 text-accent/75 font-semibold"
            >
              chat #12041
            </Link>
            <span className="h-4 w-4">
              <svg className="h-full w-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex gap-1 flex-1 w-full">
            <img
              src="/public/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/public/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="justify-self-end ml-auto text-outline1 text-sm h-full flex items-center justify-center">
              Thur, 11:02 am
            </span>
          </div>
        </li>
      </ul>
      <div className="w-8 h-full bg-canvas flex flex-col justify-center items-center">
        <button className="w-8 h-8 flex items-center justify-center">
          <svg className="w-[80%] h-full scale-y-125">
            <use xlinkHref="#caret"></use>
          </svg>
        </button>
      </div>
    </div>
  );
};

export const DesignsPage: React.FC = () => {
  const [windowSize, setWindowSize] = useState<number>(window.innerWidth);

  const handleResize = () => {
    setWindowSize(window.innerWidth);
  };
  const [sidePaneOpened, toggleSidePane] = useState(false);

  useEventListener("resize", handleResize, window as HTMLElement | any);

  return (
    <>
      <WorkspaceHeader
        sidePaneOpened={sidePaneOpened}
        toggleSidePane={toggleSidePane}
      />
      <section className="designs-section flex-1 w-full basis-auto min-h-[100vh] h-max md:mt-20 mt-32 overflow-hidden">
        <img
          src="/icons/canvas-bg.svg"
          alt="the background image of a design canvas"
          className="top-0 left-0 w-full h-full bg-repeat bg-full scale-3x md:scale-2x bg-fixed fixed select-none"
        />
        <DesignPanel />
        <CommentBoard />
        <WorkspaceSidetab sidePaneOpened={sidePaneOpened} />
      </section>
    </>
  );
};

export default DesignsPage;

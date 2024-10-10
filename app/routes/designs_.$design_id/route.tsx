import { ClientLoaderFunctionArgs, Form, Link, json } from "@remix-run/react";
import { Provider } from "react-redux";
import type { MetaFunction } from "@remix-run/node";
import useEventListener from "~/hooks/useevent";
import { useRef, useState } from "react";
import { WorkspaceHeader } from "~/components/workspace-header";
import { WorkspaceSidetab } from "~/components/workspace-sidetab";
import {
  DrawerTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "~/components/ui/drawer";
import { store } from "~/store";

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
  return (
    <div className="design-panel w-max min-w-[25rem] md:min-w-[35rem] h-32 align-center mt-32 relative z-10 mx-auto flex px-8 border-r-[18px] border-l-[18px] md:border-r-[20px] md:border-l-[20px] border-accent rounded-lg bg-canvas shadow-md drop-shadow-md shadow-outline1 py-4 z-5">
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
      <ul className="flex flex-row items-center h-full gap-4 mx-auto w-max">
        <li className="flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2">
          <div className="w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative">
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#t"></use>
            </svg>
          </div>
        </li>

        <li className="flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2">
          <div className="w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative">
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#grid"></use>
            </svg>
          </div>
        </li>

        <li className="flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2">
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
  const [boardOpened, toggleBoard] = useState(false);
  const commentBoardOpenerRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={
        "fixed top-[10rem] md:top-20 right-0 w-[25rem] h-[20rem] flex shadow-lg shadow-outline1/25 z-10" +
        `${!boardOpened ? " shadow-none" : ""}`
      }
    >
      <Drawer>
        <DrawerTrigger ref={commentBoardOpenerRef} className="invisible">
        </DrawerTrigger>
        <DrawerContent className="h-[45rem] md:h-[30rem] bg-bg pt-8 border-t-accent border-t-4">
          <DrawerHeader className="flex items-center justify-center">
            <DrawerTitle>chat #12041</DrawerTitle>
          </DrawerHeader>

          <DrawerFooter className="flex flex-col justify-between flex-1 gap-8 md:flex-row">
            <ul className="flex flex-1 w-full gap-4 overflow-x-auto md:h-full md:max-h-[60%] md:overflow-y-auto md:flex-col snap-x md:snap-y pt-2 chat-box">
              <li className="flex h-full px-2 w-full min-w-[100%] md:px-4 md:h-max snap-center">
                <div className="flex flex-col items-center w-6 mx-4">
                  <span className="w-4 h-4 origin-bottom rounded-full ring-accent bg-outline1/55 ring-1 z-[5]"></span>
                  <span className="flex-1 w-1 bg-outline1 z-2"></span>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-lg text-primary">John smith</p>
                  <p className="p-2 bg-outline1/55 text-secondaryText">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Doloribus maiores qui officia iusto asperiores praesentium
                    temporibus odit, odio cumque error ab culpa! Rerum nisi,
                    saepe voluptas atque labore iure aliquid!
                  </p>

                  <h3 className="self-end text-sm text-secondaryText">
                    Thursday 01, July 15:00
                  </h3>
                </div>
              </li>
              <li className="flex h-full px-2 w-full min-w-[100%] md:px-4 md:h-max snap-center">
                <div className="flex flex-col items-center w-6 mx-4">
                  <span className="w-4 h-4 origin-bottom rounded-full ring-accent bg-outline1/55 ring-1 z-[5]"></span>
                  <span className="flex-1 w-1 bg-outline1 z-2"></span>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-lg text-primary">John smith</p>
                  <p className="p-2 bg-outline1/55 text-secondaryText">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Doloribus maiores qui officia iusto asperiores praesentium
                    temporibus odit, odio cumque error ab culpa! Rerum nisi,
                    saepe voluptas atque labore iure aliquid!
                  </p>

                  <h3 className="self-end text-sm text-secondaryText">
                    Thursday 01, July 15:00
                  </h3>
                </div>
              </li>
              <li className="flex h-full px-2 w-full min-w-[100%] md:px-4 md:h-max snap-center">
                <div className="flex flex-col items-center w-6 mx-4">
                  <span className="w-4 h-4 origin-bottom rounded-full ring-accent bg-outline1/55 ring-1 z-[5]"></span>
                  <span className="flex-1 w-1 bg-outline1 z-2"></span>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-lg text-primary">John smith</p>
                  <p className="p-2 bg-outline1/55 text-secondaryText">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Doloribus maiores qui officia iusto asperiores praesentium
                    temporibus odit, odio cumque error ab culpa! Rerum nisi,
                    saepe voluptas atque labore iure aliquid!
                  </p>

                  <h3 className="self-end text-sm text-secondaryText">
                    Thursday 01, July 15:00
                  </h3>
                </div>
              </li>
            </ul>
            <Form className="flex flex-col gap-8 h-max md:w-[30%] w-full">
              <textarea
                name=""
                id=""
                cols={30}
                rows={10}
                maxLength={250}
                className="h-[8rem] max-h-[8rem] min-h-[8rem] md:h-[5rem] md:max-h-[5rem] md:min-h-[5rem] p-4 focus:border-2 focus:outline-none rounded focus:border-outline1 border-dashed"
              ></textarea>

              <div className="flex justify-end gap-4">
                <DrawerClose className="w-max">
                  <button className="px-8 py-4 rounded-md ring-1 ring-outline1">
                    Cancel
                  </button>
                </DrawerClose>
                <button
                  className="px-8 py-4 rounded-md ring-1 ring-outline1 bg-fg text-bg"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </Form>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ul
        className={
          "h-full flex-1 flex-col overflow-auto no-scrollbar" +
          `${!boardOpened ? " scale-0 origin-right" : ""}`
        }
      >
        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="relative flex justify-end w-full h-1/2">
            <Link
              to={""}
              className="absolute top-0 left-0 w-full h-full font-semibold text-accent/75"
              onClick={(e) => {
                e.preventDefault();
                commentBoardOpenerRef.current?.click();
              }}
            >
              chat #12041
            </Link>
            <span className="w-4 h-4">
              <svg className="w-full h-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex flex-1 w-full gap-1">
            <img
              src="/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="flex items-center justify-center h-full ml-auto text-sm justify-self-end text-outline1">
              Thur, 11:02 am
            </span>
          </div>
        </li>

        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="relative flex justify-end w-full h-1/2">
            <Link
              to={""}
              className="absolute top-0 left-0 w-full h-full font-semibold text-accent/75"
              onClick={(e) => {
                e.preventDefault();
                commentBoardOpenerRef.current?.click();
              }}
            >
              chat #12041
            </Link>
            <span className="w-4 h-4">
              <svg className="w-full h-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex flex-1 w-full gap-1">
            <img
              src="/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="flex items-center justify-center h-full ml-auto text-sm justify-self-end text-outline1">
              Thur, 11:02 am
            </span>
          </div>
        </li>

        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="relative flex justify-end w-full h-1/2">
            <Link
              to={""}
              className="absolute top-0 left-0 w-full h-full font-semibold text-accent/75"
              onClick={(e) => {
                e.preventDefault();
                commentBoardOpenerRef.current?.click();
              }}
            >
              chat #12041
            </Link>
            <span className="w-4 h-4">
              <svg className="w-full h-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex flex-1 w-full gap-1">
            <img
              src="/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="flex items-center justify-center h-full ml-auto text-sm justify-self-end text-outline1">
              Thur, 11:02 am
            </span>
          </div>
        </li>

        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="relative flex justify-end w-full h-1/2">
            <Link
              to={""}
              className="absolute top-0 left-0 w-full h-full font-semibold text-accent/75"
              onClick={(e) => {
                e.preventDefault();
                commentBoardOpenerRef.current?.click();
              }}
            >
              chat #12041
            </Link>
            <span className="w-4 h-4">
              <svg className="w-full h-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex flex-1 w-full gap-1">
            <img
              src="/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="flex items-center justify-center h-full ml-auto text-sm justify-self-end text-outline1">
              Thur, 11:02 am
            </span>
          </div>
        </li>

        <li className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2">
          <div className="relative flex justify-end w-full h-1/2">
            <Link
              to={""}
              className="absolute top-0 left-0 w-full h-full font-semibold text-accent/75"
              onClick={(e) => {
                e.preventDefault();
                commentBoardOpenerRef.current?.click();
              }}
            >
              chat #12041
            </Link>
            <span className="w-4 h-4">
              <svg className="w-full h-full">
                <use xlinkHref="#external-link"></use>
              </svg>
            </span>
          </div>
          <div className="flex flex-1 w-full gap-1">
            <img
              src="/images/emoji_student_1.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <img
              src="/images/emoji_student_2.png"
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="flex items-center justify-center h-full ml-auto text-sm justify-self-end text-outline1">
              Thur, 11:02 am
            </span>
          </div>
        </li>
      </ul>
      <div className="flex flex-col items-center justify-center w-8 h-full bg-canvas">
        <button
          className={
            "w-8 h-8 flex items-center justify-center scale-x-[-1]" +
            `${boardOpened ? " scale-x-[unset]" : ""}`
          }
          onClick={() => toggleBoard((prevBoard) => !prevBoard)}
        >
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
    <Provider store={store}>
      <WorkspaceHeader/>
      <section className="designs-section flex-1 w-full basis-auto min-h-[100vh] h-max md:mt-20 mt-32 overflow-hidden">
        <img
          src="/icons/canvas-bg.svg"
          alt="the background image of a design canvas"
          className="fixed top-0 left-0 w-full h-full bg-fixed bg-repeat select-none bg-full scale-3x md:scale-2x"
        />
        <DesignPanel />
        <CommentBoard />
        <WorkspaceSidetab />
      </section>
    </Provider>
  );
};

export default DesignsPage;

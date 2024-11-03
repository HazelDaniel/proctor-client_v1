import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Copy } from "lucide-react";
import { ResetIcon } from "@radix-ui/react-icons";
import { workspaceSelectors } from "~/store";
import {
  XOpenOutputPane,
  closeSidePane,
  openSidePane,
} from "~/reducers/workspace.reducer";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
import { UnknownAction } from "@reduxjs/toolkit";

export const WorkspaceHeader: React.FC = () => {
  const {
    outputPane: outputPaneVisible,
    sidePane: sidePaneVisible,
    settings,
  } = useSelector(workspaceSelectors);

  const dispatch = useDispatch<UnknownAction | any>();
  const [outputPaneInteract, setOutputPaneInteract] = useState<boolean>(false);

  const outputPaneOpened = !outputPaneInteract
    ? settings.outputPane
    : outputPaneVisible;

  const sidePaneOpened = sidePaneVisible;

  const toggleSidePane = useCallback(() => {
    if (sidePaneOpened) {
      dispatch(closeSidePane());
      return;
    }
    dispatch(openSidePane());
  }, [sidePaneOpened]);

  console.log("rendering workspace header...");

  return (
    <header className="workspace-header flex items-center justify-start w-full h-32 md:h-20 px-4 pr-0 bg-gradient-to-b from-bg from-80% backdrop-blur-sm fixed z-[15]">
      <div className="relative flex-row justify-start pr-4 md:w-1/4 h-3/4 flex w-max justify-self-start">
        <div className="h-full w-full flex items-center mr-auto">
          <button
            className={
              "w-8 h-8 mr-0 md:mr-auto" +
              `${sidePaneOpened ? " scale-x-[-1]" : ""}`
            }
            onClick={() => toggleSidePane()}
          >
            <svg className="w-full h-full">
              <use xlinkHref="#open-side-tab"></use>
            </svg>
          </button>

          <div className="md:flex w-max justify-between hidden">
            <button className="w-8 h-8 mr-8 active:scale-90">
              <ResetIcon className="h-full w-full scale-[0.8]" />
            </button>

            <button className="w-8 h-8 active:scale-90">
              <ResetIcon className="h-full w-full scale-x-[-0.8] scale-y-[0.8]" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-0 md:block mx-0 md:mx-auto">
        <input
          type="text"
          name=""
          id=""
          className="bg-transparent outline-none fixed md:static top-32 md:top-0  x-centered-absolute text-center font-semibold focus:ring-1 focus:ring-outline1 rounded-md"
          defaultValue={"untitled_project"}
        />
      </div>

      {/* star and other header components */}
      <div className="w-[15rem] flex justify-between items-center mx-auto md:mx-0">
        <span className="w-8 h-8 flex items-center justify-center">
          <svg
            viewBox="0 0 35 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.022 3.30198L14.2449 9.97903C13.5968 11.5371 12.1316 12.6016 10.4495 12.7365L3.24109 13.3144L8.73315 18.0189C10.0147 19.1167 10.5744 20.8392 10.1828 22.4806L8.50492 29.5148L14.6763 25.7453C16.1164 24.8657 17.9276 24.8657 19.3676 25.7453L25.5391 29.5148L23.8611 22.4806C23.4696 20.8392 24.0293 19.1167 25.3108 18.0189L30.8029 13.3144L23.5945 12.7365C21.9124 12.6016 20.4472 11.5371 19.7991 9.97903L17.022 3.30198ZM18.8686 1.23194C18.1854 -0.410647 15.8585 -0.410645 15.1754 1.23194L11.9365 9.01895C11.6485 9.71142 10.9973 10.1846 10.2497 10.2445L1.843 10.9185C0.0696952 11.0606 -0.649356 13.2736 0.701718 14.431L7.10676 19.9176C7.67634 20.4055 7.92508 21.171 7.75107 21.9005L5.79422 30.1041C5.38145 31.8345 7.26395 33.2023 8.78215 32.2749L15.9795 27.8788C16.6195 27.4879 17.4245 27.4879 18.0645 27.8788L25.2618 32.2749C26.78 33.2023 28.6625 31.8345 28.2498 30.1041L26.2929 21.9005C26.1189 21.171 26.3676 20.4055 26.9372 19.9176L33.3423 14.431C34.6933 13.2736 33.9743 11.0606 32.201 10.9185L23.7942 10.2445C23.0467 10.1846 22.3954 9.71142 22.1074 9.01895L18.8686 1.23194Z"
              fill="#020617"
            />
          </svg>
        </span>

        <ul className="w-max flex h-8">
          <li className="w-8 h-8 rounded-full drop-shadow-md rotate-[-3deg] mx-[-0.3rem] select-none">
            <img src="/images/emoji_student_2.png" alt="" />
          </li>
          <li className="w-8 h-8 rounded-full drop-shadow-md rotate-[-3deg] mx-[-0.3rem] select-none">
            <img src="/images/emoji_student_1.png" alt="" />
          </li>
          <li className="w-8 h-8 rounded-full drop-shadow-md bg-canvas mx-[-0.3rem] select-none">
            <span className="w-full h-full flex items-center justify-center">
              +2
            </span>
          </li>
        </ul>

        <span className="w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full">
            <use xlinkHref="#export"></use>
          </svg>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none z-8 w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full">
              <use xlinkHref="#kebab"></use>
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[15rem] mr-8 rounded-md p-2 bg-canvas *:outline-none *:focus:outline-none drop-shadow-md mt-4 z-[15]">
            <DropdownMenuItem className="rounded-sm p-4 cursor-pointer">
              invite collaborator
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-outline1 w-full h-[1px]" />
            <DropdownMenuItem className="rounded-sm p-4 cursor-pointer">
              record session
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-outline1 w-full h-[1px]" />
            <DropdownMenuItem className="rounded-sm p-4 cursor-pointer text-danger">
              leave session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet
        open={outputPaneOpened}
        onOpenChange={() => setOutputPaneInteract(true)}
      >
        <SheetTrigger asChild>
          <button
            className="w-16 h-[80%] md:h-full self-start hover:bg-accent/25 flex items-center justify-center ml-2 transition-colors duration-300"
            onClick={() => {
              dispatch(XOpenOutputPane());
            }}
          >
            <svg className="w-[80%] md:w-8 h-full scale-90">
              <use xlinkHref="#code"></use>
            </svg>
          </button>
        </SheetTrigger>
        <SheetTitle className="sr-only">
          output pane of the db design
        </SheetTitle>
        <SheetContent className="bg-primary w-[80%] pt-16 flex flex-col md:min-w-[40rem] border-none">
          <SheetHeader>
            <div className="flex justify-between h-max">
              <p className="h-4 w-max text-muted-foreground">Output SQL</p>
              <div className="h-full w-max flex">
                <span className="h-[20px] w-[20px] cursor-pointer mx-2">
                  <Copy className="stroke-muted-foreground w-full h-full" />
                </span>
                <span className="h-[20px] w-[20px] cursor-pointer mx-2">
                  <ResetIcon className="stroke-muted-foreground w-full h-full" />
                </span>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 w-full relative">
            <pre className="text-accent overflow-scroll no-scrollbar h-full bg-outline1/5 p-2 ring-1 ring-outline1/20 rounded-sm">
              CREATE TABLE users (<br /> user_id UUID PRIMARY KEY DEFAULT
              random_uuid()
              <br />
              );
            </pre>
          </div>

          <SheetDescription className="justify-self-end mt-auto text-center">
            Always double check generated SQL codes for errors.
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </header>
  );
};

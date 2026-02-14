import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useParams } from "@remix-run/react";
import React, { useState } from "react";

type InvitationsTabProps = {};

const InvitationsTab: React.FC<InvitationsTabProps> = () => {
  const tab = useParams().invite as "pending" | "received" | null;
  console.log("tab is ", tab);
  const current: "pending" | "received" = useState<"pending" | "received">(
    tab || "received"
  )[0];

  return (
    <div className="w-full h-max min-h-[20rem] p-4 py-2 rounded-md border-gray-100 border-2 flex flex-col justify-start">
      <div className="w-full rounded-[5px] flex justify-start items-center h-10 gap-4 text-sm">
        <button
          className={`p-2 px-4 rounded-md  [&.active]:bg-accent [&.active]:shadow-[inset_0px_4px_37px_rgba(0,_0,_0,_0.25)] border-muted [&.active]:border-[unset] border-2 text-foreground/80 [&.active]:text-white ${
            current === "pending" ? "active" : ""
          }`}
        >
          Pending
        </button>
        <button
          className={`p-2 px-4 rounded-md  [&.active]:bg-accent [&.active]:shadow-[inset_0px_4px_37px_rgba(0,_0,_0,_0.25)] border-muted [&.active]:border-[unset] border-2 text-foreground/80 [&.active]:text-white ${
            current === "received" ? "active" : ""
          }`}
        >
          Received
        </button>
      </div>
      <div className="w-full h-[1px] bg-gray-200 my-2"></div>

      <div className="flex-1 max-h-[20rem] overflow-y-auto flex flex-col justify-start gap-6">
        <div className="w-full h-max flex justify-start items-center gap-[6%]">
          <div className="size-12 min-h-12 min-w-12 bg-muted-foreground/60 border-4 border-mutedFG/20 text-4xl text-foreground/40 font-semibold flex items-center justify-center rounded-sm">
            W
          </div>

          <div className="flex-1 flex justify-between items-start py-2 gap-[12%]">
            <div className="flex-1 flex flex-col justify-start gap-2">
              <p className="text-foreground">Workspace 1</p>

              <div
                className="w-full flex gap-2 justify-start"
                title="By Evan. Li. Received 2 mins ago. 4 members"
              >
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate justify-self-[start_!important]">
                  By Evan. Li.
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  2 mins ago
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  4 members
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
                <button className="flex items-center justify-center w-10 h-full text-muted-foreground/80 mt-1">
                  <svg className="h-4 h-inherit scale-50 cursor-pointer origin-center">
                    <use xlinkHref="#kebab" className=""></use>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Accept
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="w-full h-max flex justify-start items-center gap-[6%]">
          <div className="size-12 min-h-12 min-w-12 bg-accent/60 border-4 border-mutedFG/20 text-4xl text-foreground/40 font-semibold flex items-center justify-center rounded-sm">
            J
          </div>

          <div className="flex-1 flex justify-between items-start py-2 gap-[12%]">
            <div className="flex-1 flex flex-col justify-start gap-2">
              <p className="text-foreground">Jane's Work</p>

              <div
                className="w-full flex gap-2 justify-start"
                title="By Evan. Li. Received 2 mins ago. 4 members"
              >
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate justify-self-[start_!important]">
                  By Evan. Li.
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  2 mins ago
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  4 members
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
                <button className="flex items-center justify-center w-10 h-full text-muted-foreground/80 mt-1">
                  <svg className="h-4 h-inherit scale-50 cursor-pointer origin-center">
                    <use xlinkHref="#kebab" className=""></use>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Accept
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="w-full h-max flex justify-start items-center gap-[6%]">
          <div className="size-12 min-h-12 min-w-12 bg-accent/60 border-4 border-mutedFG/20 text-4xl text-foreground/40 font-semibold flex items-center justify-center rounded-sm">
            J
          </div>

          <div className="flex-1 flex justify-between items-start py-2 gap-[12%]">
            <div className="flex-1 flex flex-col justify-start gap-2">
              <p className="text-foreground">Jane's Work</p>

              <div
                className="w-full flex gap-2 justify-start"
                title="By Evan. Li. Received 2 mins ago. 4 members"
              >
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate justify-self-[start_!important]">
                  By Evan. Li.
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  2 mins ago
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  4 members
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
                <button className="flex items-center justify-center w-10 h-full text-muted-foreground/80 mt-1">
                  <svg className="h-4 h-inherit scale-50 cursor-pointer origin-center">
                    <use xlinkHref="#kebab" className=""></use>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Accept
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="w-full h-max flex justify-start items-center gap-[6%]">
          <div className="size-12 min-h-12 min-w-12 bg-accent/60 border-4 border-mutedFG/20 text-4xl text-foreground/40 font-semibold flex items-center justify-center rounded-sm">
            J
          </div>

          <div className="flex-1 flex justify-between items-start py-2 gap-[12%]">
            <div className="flex-1 flex flex-col justify-start gap-2">
              <p className="text-foreground">Jane's Work</p>

              <div
                className="w-full flex gap-2 justify-start"
                title="By Evan. Li. Received 2 mins ago. 4 members"
              >
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate justify-self-[start_!important]">
                  By Evan. Li.
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  2 mins ago
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  4 members
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
                <button className="flex items-center justify-center w-10 h-full text-muted-foreground/80 mt-1">
                  <svg className="h-4 h-inherit scale-50 cursor-pointer origin-center">
                    <use xlinkHref="#kebab" className=""></use>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Accept
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="w-full h-max flex justify-start items-center gap-[6%]">
          <div className="size-12 min-h-12 min-w-12 bg-accent/60 border-4 border-mutedFG/20 text-4xl text-foreground/40 font-semibold flex items-center justify-center rounded-sm">
            J
          </div>

          <div className="flex-1 flex justify-between items-start py-2 gap-[12%]">
            <div className="flex-1 flex flex-col justify-start gap-2">
              <p className="text-foreground">Jane's Work</p>

              <div
                className="w-full flex gap-2 justify-start"
                title="By Evan. Li. Received 2 mins ago. 4 members"
              >
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate justify-self-[start_!important]">
                  By Evan. Li.
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  2 mins ago
                </span>
                <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
                  4 members
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
                <button className="flex items-center justify-center w-10 h-full text-muted-foreground/80 mt-1">
                  <svg className="h-4 h-inherit scale-50 cursor-pointer origin-center">
                    <use xlinkHref="#kebab" className=""></use>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Accept
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsTab;

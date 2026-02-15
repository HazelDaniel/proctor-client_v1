import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useLoaderData, useSearchParams, Await } from "@remix-run/react";
import React, { useCallback, useMemo, Suspense } from "react";

type InvitationsTabProps = {};

type InvitationsTabEntryProps = {
  id: string;
  ownerUsername: string;
  name: string;
  time: string;
  members: number;
  ofType: "received" | "pending";
};

const InvitationsTabEntry: React.FC<{
  ownerUsername: string;
  name: string;
  time: string;
  members: number;
  id: string;
  ofType: "received" | "pending";
}> = ({ members, name, ownerUsername, time, id, ofType }) => {
  void id;

  const generateRandomBetween0And255 = useCallback(() => {
    return Math.floor(Math.random() * 256);
  }, []);

  const rvalue = useMemo(
    () => generateRandomBetween0And255(),
    [generateRandomBetween0And255]
  );
  const gvalue = useMemo(
    () => generateRandomBetween0And255(),
    [generateRandomBetween0And255]
  );
  const bvalue = useMemo(
    () => generateRandomBetween0And255(),
    [generateRandomBetween0And255]
  );
  const randomColor = `rgba(${rvalue}, ${gvalue}, ${bvalue}, 0.6)`;

  // Simple time ago logic (server returns ISO strings)
  const timeAgo = useMemo(() => {
    const date = new Date(time);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  }, [time]);

  return (
    <div className="w-full h-max flex justify-start items-center gap-[6%] overflow-hidden relative">
      <div
        className={`size-12 min-h-12 min-w-12 border-4 border-mutedFG/20 text-4xl text-foreground/40 font-semibold flex items-center justify-center rounded-sm uppercase`}
        style={{ backgroundColor: `${randomColor}` }}
      >
        {name ? name[0] : ""}
      </div>

      <div className="flex-1 flex justify-between items-start py-2 gap-[12%] max-w-full">
        <div className="flex-1 max-w-[70%] flex flex-col justify-start gap-2">
          <p className="text-foreground w-max">{name}</p>

          <div
            className="w-full flex gap-2 justify-start"
            title={`${
              ofType === "pending" ? "To" : "By" } ${ownerUsername}. Received ${timeAgo}. ${members} members`}
          >
            <span className="text-mutedFG text-xs font-medium w-1/3 truncate justify-self-[start_!important]">
              {`${ofType === "pending" ? "to " : "By "}`} {ownerUsername}
            </span>
            <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
              {timeAgo}
            </span>
            <span className="text-mutedFG text-xs font-medium w-1/3 truncate">
              {members} members
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none absolute top-2 right-2">
            <button className="flex items-center justify-center w-10 h-full text-muted-foreground/80 mt-1">
              <svg className="h-4 h-inherit scale-50 cursor-pointer origin-center">
                <use xlinkHref="#kebab" className=""></use>
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
            {ofType === "received" ? (
              <>
                <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                  Accept
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : null}

            <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
              {ofType === "pending" ? "Rescind" : "Decline"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const InvitationsTab: React.FC<InvitationsTabProps> = () => {
  const [params, setParams] = useSearchParams();
  const { receivedInvitations, pendingInvitations } = useLoaderData<any>();

  let current = params.get("invite") as "pending" | "received" | null;
  current = current ?? "received";

  const renderContent = (data: any[], type: "received" | "pending") => {
    if (!data || data.length === 0) {
      return (
        <div className="w-full py-8 text-center text-mutedFG text-sm">
          No {type} invitations found.
        </div>
      );
    }

    return data.map((inv: any) => {
      const entry: InvitationsTabEntryProps = {
        id: type === "received" ? inv.inviteId : inv.id,
        ownerUsername: type === "received" ? (inv.inviterEmail.split("@")[0]) : (inv.inviteeEmail.split("@")[0]),
        name: inv.toolType || "Unknown Project",
        time: inv.createdAt,
        members: inv.memberCount,
        ofType: type,
      };
      return <InvitationsTabEntry {...entry} key={entry.id} />;
    });
  };

  return (
    <div className="w-full h-max min-h-[20rem] p-4 py-2 rounded-md border-gray-100 border-2 flex flex-col justify-start">
      <div className="w-full rounded-[5px] flex justify-start items-center h-10 gap-4 text-sm">
        <button
          className={`p-1.5 text-xs px-4 rounded-md [&.active]:bg-accent [&.active]:shadow-[inset_0px_4px_37px_rgba(0,_0,_0,_0.25)] border-muted [&.active]:border-[unset] border-2 text-foreground/80 [&.active]:text-white ${
            current === "pending" ? "active" : ""
          }`}
          onClick={() =>
            setParams({ invite: "pending" }, { preventScrollReset: true })
          }
        >
          Pending
        </button>
        <button
          className={`p-1.5 text-xs px-4 rounded-md [&.active]:bg-accent [&.active]:shadow-[inset_0px_4px_37px_rgba(0,_0,_0,_0.25)] border-muted [&.active]:border-[unset] border-2 text-foreground/80 [&.active]:text-white ${
            current === "received" ? "active" : ""
          }`}
          onClick={() => setParams({ invite: "received" })}
        >
          Received
        </button>
      </div>
      <div className="w-full h-[1px] bg-gray-200 my-2"></div>

      <div className="flex-1 max-h-[20rem] overflow-y-auto flex flex-col justify-start gap-6">
        <Suspense fallback={<div className="w-full py-8 text-center text-mutedFG text-sm animate-pulse">Loading invitations...</div>}>
          {current === "received" ? (
            <Await resolve={receivedInvitations}>
              {(data) => renderContent(data, "received")}
            </Await>
          ) : (
            <Await resolve={pendingInvitations}>
              {(data) => renderContent(data, "pending")}
            </Await>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default InvitationsTab;


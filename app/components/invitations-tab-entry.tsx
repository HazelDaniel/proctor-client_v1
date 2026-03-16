import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Form } from "@remix-run/react";
import React, { useCallback, useMemo } from "react";

export type InvitationsTabEntryProps = {
  id: string;
  ownerUsername: string;
  name: string;
  time: string;
  members: number;
  ofType: "received" | "pending";
};

export const InvitationsTabEntry: React.FC<InvitationsTabEntryProps> = ({
  members,
  name,
  ownerUsername,
  time,
  id,
  ofType,
}) => {
  void id;

  const generateRandomBetween0And255 = useCallback(() => {
    return Math.floor(Math.random() * 256);
  }, []);

  const rvalue = useMemo(() => generateRandomBetween0And255(), [generateRandomBetween0And255]);
  const gvalue = useMemo(() => generateRandomBetween0And255(), [generateRandomBetween0And255]);
  const bvalue = useMemo(() => generateRandomBetween0And255(), [generateRandomBetween0And255]);
  const randomColor = `rgba(${rvalue}, ${gvalue}, ${bvalue}, 0.6)`;

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
            title={`${ofType === "pending" ? "To" : "By"} ${ownerUsername}. ${ofType === "pending" ? "Sent" : "Received"} ${timeAgo}. ${members} members`}
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
            <Form method="post">
              <input type="hidden" name="inviteId" value={id} />
              {ofType === "received" ? (
                <>
                  <button
                    type="submit"
                    name="intent"
                    value="ACCEPT_INVITATION"
                    className="w-full text-left focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer hover:bg-muted/50 px-2 rounded-sm"
                  >
                    Accept
                  </button>
                  <DropdownMenuSeparator className="my-2 bg-outline1 h-[1px]" />
                  <button
                    type="submit"
                    name="intent"
                    value="DECLINE_INVITATION"
                    className="w-full text-left focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer hover:bg-muted/50 px-2 rounded-sm"
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  name="intent"
                  value="RESCIND_INVITATION"
                  className="w-full text-left focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer hover:bg-muted/50 px-2 rounded-sm"
                >
                  Rescind
                </button>
              )}
            </Form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

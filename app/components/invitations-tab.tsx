import { useLoaderData, useSearchParams, Await } from "@remix-run/react";

import React, { Suspense } from "react";
import { InvitationsTabEntry, InvitationsTabEntryProps } from "./invitations-tab-entry";

type InvitationsTabProps = {};

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

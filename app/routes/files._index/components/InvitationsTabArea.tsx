import React from "react";
import InvitationsTab from "~/components/invitations-tab";

export const InvitationsTabArea: React.FC = () => {
  return (
    <>
      <h2 className="w-full my-6 mt-0 capitalize text-fg">invitations</h2>
      <InvitationsTab />
    </>
  );
};

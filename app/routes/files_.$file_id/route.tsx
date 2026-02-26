import { ClientActionFunctionArgs, ClientLoaderFunctionArgs, Form, json, redirect, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useDispatch, useSelector } from "react-redux";
import type { MetaFunction } from "@remix-run/node";
import useEventListener from "~/hooks/useevent";
import React, {
  useEffect,
  useState,
} from "react";
import { WorkspaceHeader } from "~/components/workspace-header";
import { WorkspaceSidetab } from "~/components/workspace-sidetab";
import {
  RootState,
  settingsSelector,
} from "~/store";
import {
} from "~/reducers/workspace.reducer";
import "@xyflow/react/dist/style.css";
import { DesignCanvas } from "~/components/design-canvas";
import { ChatBubbleViewCtx } from "~/context-components/chat-bubble-view.context";
import { handleResize } from "~/event-handlers/workspace.handlers";
import { Edge, ReactFlowInstance, ReactFlowProvider } from "@xyflow/react";
import { StatefulNodeType } from "~/types";
import { CollaborationProvider } from "~/contexts/collaboration.context";
import { setUser, logout } from "~/reducers/auth.reducer";
import { useParams } from "@remix-run/react";
import { store } from "~/store";
import { gqlRequest } from "~/utils/api";
import { ChatPanel } from "~/components/chat-panel";

export const meta: MetaFunction = () => {
  return [
    { title: "design | proctor" },
    { name: "description", content: "proctor design file" },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
    },
  ];
};

export const clientAction = async ({ params, request }: ClientActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const instanceId = params.file_id;

  if (intent === "INVITE_COLLABORATOR") {
    const email = formData.get("email") as string;
    if (!email) return json({ error: "Email is required" }, { status: 400 });

    try {
      await gqlRequest(`
        mutation CreateInvite($instanceId: String!, $email: String!) {
          createToolInstanceInvite(instanceId: $instanceId, email: $email) {
            token
          }
        }
      `, { instanceId, email });

      return json({ success: true, message: `Invitation sent to ${email}` });
    } catch (err: any) {
      console.error("Failed to create invite:", err);
      return json({ error: err.message || "Failed to send invitation" }, { status: 500 });
    }
  }

  if (intent === "RENAME_TOOL_INSTANCE") {
    const name = formData.get("name") as string;
    if (!name) return json({ error: "Name is required" }, { status: 400 });
    
    try {
      await gqlRequest(`
        mutation RenameToolInstance($instanceId: String!, $name: String!) {
          renameToolInstance(instanceId: $instanceId, name: $name) {
             id
             name
          }
        }
      `, { instanceId, name });
      return json({ success: true, name });
    } catch (err: any) {
      return json({ error: err.message || "Failed to rename" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};


export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const file_id = params.file_id;
  
  const cookieHeader = request.headers.get("Cookie");
  let headers: Record<string, string> | undefined = undefined;
  
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, decodeURIComponent(v.join('='))];
      })
    );
    if (cookies.access_token) {
      headers = {
        Authorization: `Bearer ${cookies.access_token}`,
        Cookie: cookieHeader
      };
    } else {
      headers = { Cookie: cookieHeader };
    }
  }

  let user = null;
  try {
    const data = await gqlRequest(`
      query GetCurrentUser {
        getCurrentUser {
          id
          email
          username
          emailVerified
          avatarUrl
        }
      }
    `, undefined, headers);
    if (data.getCurrentUser) {
      user = data.getCurrentUser;
    } else {
      return redirect("/auth");
    }
  } catch (err) {
    return redirect("/auth");
  }

  // 2. Check file-level access (ownership/collaboration) and get details
  let toolInstance;
  try {
    const res = await gqlRequest(`
      query CheckAccess($instanceId: String!) {
        toolInstance(instanceId: $instanceId) {
          id
          toolType
          name
          ownerId
        }
      }
    `, { instanceId: file_id }, headers);
    toolInstance = res.toolInstance;
  } catch (err) {
    console.error("Access denied:", err);
    return redirect("/auth");
  }

  return json({ designId: file_id, toolInstance, user });
};

export const clientLoader = async ({ serverLoader }: ClientLoaderFunctionArgs) => {
  const data = (await serverLoader()) as any;
  if (data.user) {
    store.dispatch(setUser(data.user));
  } else {
    store.dispatch(logout());
  }
  return data;
};
clientLoader.hydrate = true;

export const ChatPanelWrapper: React.FC<{fileId: string}> = ({fileId}) => {
  const isOpen = useSelector((state: RootState) => state.chat.isOpen);

  return <>
    <div className={`absolute right-0 top-0 h-full w-[350px] ${isOpen ? " z-20 " : " z-[-1_!important] "} pointer-events-none`}>
      <div className="h-full w-full pointer-events-auto">
        <ChatPanel instanceId={fileId} />
      </div>
    </div>
  </>
}

export const DesignsPage: React.FC = React.memo(function DesignPageMemoized () {
  const [_, setWindowSize] = useState<number>(window.innerWidth);
  const [instance, setInstance] =
    useState<ReactFlowInstance<StatefulNodeType & { id: string }, Edge>>();
  const params = useParams();
  const fileId = params.file_id || 'default-design';
  
  // Use the actual userId for socket auth so the gateway can identify the user
  const userId = store.getState().auth.user?.id || '';

  useEventListener(
    "resize",
    handleResize(null, (_, width) => setWindowSize(width)),
    window as HTMLElement | any
  );

  return (
    <CollaborationProvider instanceId={fileId} token={userId}>
      <WorkspaceHeader 
        initialName={useLoaderData<typeof clientLoader>().toolInstance?.name || 'untitled'} 
        instanceId={useLoaderData<typeof clientLoader>().toolInstance?.id || fileId}
      />
      <section className="designs-section flex-1 w-full basis-auto h-max md:mt-20 mt-32 overflow-hidden">
        <ReactFlowProvider>
          <ChatBubbleViewCtx>

            <div
              className="w-[100vw] max-w-[100vw] h-[82vh] md:h-[87vh] relative bottom-0 overflow-hidden my-auto"
              id="design-canvas-wrapper"
            >
              <DesignCanvas instance={instance} setInstance={setInstance} />

              <ChatPanelWrapper fileId={`${fileId}`}/>

            </div>

            <WorkspaceSidetab />
          </ChatBubbleViewCtx>
        </ReactFlowProvider>
      </section>
    </CollaborationProvider>
  );
});

export default DesignsPage;

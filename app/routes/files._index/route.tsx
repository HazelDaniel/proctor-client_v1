import { ClientActionFunctionArgs, ClientLoaderFunctionArgs, Form, defer, json, redirect, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { FilesHeader } from "~/components/files-header";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { FilesSearchBox } from "~/components/files-search-box";
import { FilesSearchProvider, useFilesSearch } from "~/contexts/files-search.context";
import useEventListener from "~/hooks/useevent";
import { store } from "~/store";
import { gqlRequest } from "~/utils/api";
import { toast } from "sonner";
import { setUser, logout } from "~/reducers/auth.reducer";
import { AxiosError } from "axios";
import { ArchivedProjectsArea } from "./components/ArchivedProjectsArea";
import { ProjectOptionsArea } from "./components/ProjectOptionsArea";
import { ProjectTabLinks } from "./components/ProjectTabLinks";
import { FileListView } from "./components/FileListView";

export const meta: MetaFunction = () => {
  return [
    { title: "files | proctor" },
    { name: "description", content: "proctor files page" },
  ];
};

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "CREATE_SCHEMA_DESIGN") {
    try {
      const result = await gqlRequest(`
        mutation CreateToolInstance($toolType: String!) {
          createToolInstance(toolType: $toolType) {
            instance {
              id
            }
          }
        }
      `, { toolType: "schema-design" });

      const newId = result.createToolInstance.instance.id;
      return redirect(`/files/${newId}`);
    } catch (err) {
      toast.error("Failed to create project");
      console.error("Failed to create tool instance:", err);
      return json({ error: "Failed to create project" }, { status: 500 });
    }
  }

  if (intent === "ACCEPT_INVITATION") {
    const inviteId = formData.get("inviteId");
    try {
      await gqlRequest(`
        mutation AcceptInvite($inviteId: String!) {
          acceptToolInstanceInviteById(inviteId: $inviteId)
        }
      `, { inviteId });
      return json({ success: true, message: "Invitation accepted" });
    } catch (err: any) {
      return json({ error: err.message || "Failed to accept invitation" }, { status: 500 });
    }
  }

  if (intent === "DECLINE_INVITATION") {
    const inviteId = formData.get("inviteId");
    try {
      await gqlRequest(`
        mutation DeclineInvite($inviteId: String!) {
          declineInvite(inviteId: $inviteId)
        }
      `, { inviteId });
      return json({ success: true, message: "Invitation declined" });
    } catch (err: any) {
      return json({ error: err.message || "Failed to decline invitation" }, { status: 500 });
    }
  }

  if (intent === "RESCIND_INVITATION") {
    const inviteId = formData.get("inviteId");
    try {
      await gqlRequest(`
        mutation RevokeInvite($inviteId: String!) {
          revokeToolInstanceInvite(inviteId: $inviteId)
        }
      `, { inviteId });
      return json({ success: true, message: "Invitation rescinded" });
    } catch (err: any) {
      return json({ error: err.message || "Failed to rescind invitation" }, { status: 500 });
    }
  }

  if (intent === "RENAME_TOOL_INSTANCE") {
    const instanceId = formData.get("instanceId");
    const name = formData.get("name");
    try {
      await gqlRequest(`
        mutation RenameToolInstance($instanceId: String!, $name: String!) {
          renameToolInstance(instanceId: $instanceId, name: $name) {
             id
             name
          }
        }
      `, { instanceId, name });
      return json({ success: true, message: "Renamed" });
    } catch (err: any) {
      return json({ error: err.message || "Failed to rename" }, { status: 500 });
    }
  }

  if (intent === "ARCHIVE_TOOL_INSTANCE") {
    const instanceId = formData.get("instanceId");
    try {
      await gqlRequest(`
        mutation ArchiveToolInstance($instanceId: String!) {
          archiveToolInstance(instanceId: $instanceId)
        }
      `, { instanceId });
      return json({ success: true, message: "Archived" });
    } catch (err: any) {
      return json({ error: err.message || "Failed to archive" }, { status: 500 });
    }
  }

  if (intent === "UNARCHIVE_TOOL_INSTANCE") {
    const instanceId = formData.get("instanceId");
    try {
      await gqlRequest(`
        mutation UnarchiveToolInstance($instanceId: String!) {
          unarchiveToolInstance(instanceId: $instanceId)
        }
      `, { instanceId });
      return json({ success: true, message: "Unarchived" });
    } catch (err: any) {
      return json({ error: err.message || "Failed to unarchive" }, { status: 500 });
    }
  }

  if (intent === "DELETE_TOOL_INSTANCE") {
    const instanceId = formData.get("instanceId");
    try {
      await gqlRequest(`
        mutation DeleteToolInstance($instanceId: String!) {
          deleteToolInstance(instanceId: $instanceId)
        }
      `, { instanceId });
      return json({ success: true, message: "Deleted" });
    } catch (err: any) {
      return json({ error: err.message || "Failed to delete" }, { status: 500 });
    }
  }

  if (intent === "RECORD_TOOL_ACCESS") {
    const instanceId = formData.get("instanceId");
    try {
      await gqlRequest(`
        mutation RecordToolAccess($instanceId: String!) {
          recordToolAccess(instanceId: $instanceId)
        }
      `, { instanceId });
      return json({ success: true });
    } catch (err) {
      return json({ error: "Failed to record access" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sortBy") || "recent";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  
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
  // Fetch user on the server to prevent initial render without auth
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
    console.log(err);
    return redirect("/auth");
  }

  // Fetch the rest of the data in parallel on the server
  const receivedInvitations = gqlRequest(`
    query MyReceivedInvitations {
      myReceivedInvitations {
        inviteId
        instanceId
        inviteeEmail
        status
        createdAt
        expiresAt
        toolType
        inviterEmail
        memberCount
      }
    }
  `, undefined, headers).then(res => res.myReceivedInvitations);

  const pendingInvitations = gqlRequest(`
    query MyPendingInvites {
      myPendingInvites {
        id
        instanceId
        inviteeEmail
        status
        createdAt
        expiresAt
        toolType
        memberCount
      }
    }
  `, undefined, headers).then(res => res.myPendingInvites);


  const toolInstances = gqlRequest(`
    query ListMyTools($sortBy: String, $page: Int, $limit: Int) {
      toolInstances(sortBy: $sortBy, page: $page, limit: $limit) {
        items {
          id
          toolType
          createdAt
          ownerId
          name
          lastAccessedAt
          accessCount
        }
        totalCount
        totalPages
        currentPage
      }
    }
  `, { sortBy, page, limit: 10 }, headers).then(res => {
    // console.log("response result was ", res);
    if (!res?.toolInstances) {
      return { items: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }
    // console.log("the items are: ");
    // console.log(res.toolInstances.items);
    return {
      items: res.toolInstances.items.map((t: any) => ({
        id: t.id || "unknown",
        toolType: t.toolType || "unknown",
        createdAt: t.createdAt ? new Date(isNaN(+t.createdAt) ? t.createdAt : +t.createdAt) : new Date(),
        ownerID: t.ownerId || "unknown",
        name: t.name || "Untitled Project",
        lastAccessedAt: t.lastAccessedAt ? new Date(isNaN(+t.lastAccessedAt) ? t.lastAccessedAt : +t.lastAccessedAt) : undefined,
        accessCount: t.accessCount || 0,
      })),
      totalCount: res.toolInstances.totalCount || 0,
      totalPages: res.toolInstances.totalPages || 0,
      currentPage: res.toolInstances.currentPage || 1,
    };
  }).catch(err => {
    if (err instanceof AxiosError) {
      // console.error("\n---------------------error happened fetching tool instance", JSON.stringify(err.response?.data.errors));
    }
    if (err.message?.includes('Unauthorized') || err.message?.includes('Forbidden')) {
      return redirect("/auth");
    }
    return { items: [], totalCount: 0, totalPages: 0, currentPage: 1 };
  });

  /* Fetch archived projects */
  const archivedProjects = gqlRequest(`
    query ListArchivedTools {
      myArchivedToolInstances {
        id
        toolType
        createdAt
        ownerId
        name
        archivedAt
      }
    }
  `, undefined, headers).then(res => {
    if (!res?.myArchivedToolInstances || !Array.isArray(res.myArchivedToolInstances)) {
      return [];
    }
    return res.myArchivedToolInstances.map((t: any) => ({
      id: t.id,
      toolType: t.toolType,
      createdAt: t.createdAt ? new Date(isNaN(+t.createdAt) ? t.createdAt : +t.createdAt) : new Date(),
      ownerID: t.ownerId,
      name: t.name || "Untitled Project",
      archivedAt: t.archivedAt ? new Date(isNaN(+t.archivedAt) ? t.archivedAt : +t.archivedAt) : new Date(),
    }));
  }).catch(err => {
    return [];
  });

  return defer({
    user,
    receivedInvitations,
    pendingInvitations,
    toolInstances,
    archivedProjects,
  });
};

export const clientLoader = async ({ serverLoader }: ClientLoaderFunctionArgs) => {

  console.log("calling files index client loader");
  const data = await serverLoader<{user: any}>();
  if (data.user) {
    store.dispatch(setUser(data.user));
  } else {
    store.dispatch(logout());
  }
  return data;
};
clientLoader.hydrate = true;


export const FilesPage: React.FC = () => {
  const [windowSize, setWindowSize] = useState<number>(window.innerWidth);

  const handleResize = () => {
    setWindowSize(window.innerWidth);
  };

  useEventListener("resize", handleResize, window as HTMLElement | any);

  return (
    <FilesSearchProvider>
      <FilesHeader />
      <section className="files-section flex-1 w-full basis-auto min-h-[100vh] h-[max-content] md:mt-20 mt-32">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[100vh] rounded-lg w-full"
        >
          <ResizablePanel
            defaultSize={windowSize > 800 ? 25 : 10}
            maxSize={windowSize > 800 ? 40 : 100}
          >
            <div className="flex h-full flex-col justify-start p-4 md:max-w-[30rem] sm:max-w-[100vw] min-w-[20rem] items-start">
              <FilesSearchBox />
              <ArchivedProjectsArea />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="w-[3px]" />
          <ResizablePanel defaultSize={75}>
            <div className="flex flex-col items-center justify-start h-full p-6">
              <ProjectOptionsArea />
              <ProjectTabLinks />
              <FileListView />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </FilesSearchProvider>
  );
};

export default FilesPage;

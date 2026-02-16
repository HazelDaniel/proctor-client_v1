import { Await, ClientActionFunctionArgs, ClientLoaderFunctionArgs, Form, defer, json, redirect, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import type { MetaFunction } from "@remix-run/node";
import { FilesHeader } from "~/components/files-header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { FilesSearchBox } from "~/components/files-search-box";
import { useState } from "react";
import useEventListener from "~/hooks/useevent";
import { Link } from "@remix-run/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import InvitationsTab from "~/components/invitations-tab";
import { store } from "~/store";
import { gqlRequest } from "~/utils/api.client";
import { ToolInstanceType } from "~/types";

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

  return json({ error: "Invalid intent" }, { status: 400 });
};


export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const state = store.getState();
  // Ensure we only redirect after we've attempted to initialize auth
  if (state.auth.isInitialized && !state.auth.isAuthenticated) {
    return redirect("/auth");
  }

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
  `).then(res => res.myReceivedInvitations);

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
  `).then(res => res.myPendingInvites);


  const toolInstances = gqlRequest(`
    query ListMyTools {
      toolInstances {
        id
        toolType
        createdAt
        ownerId
        name
      }
    }
  `).then(res => {
    console.debug("[FilesLoader] GraphQL raw response:", res);
    if (!res?.toolInstances || !Array.isArray(res.toolInstances)) {
      console.warn("[FilesLoader] Unexpected toolInstances format or missing data:", res);
      return [];
    }
    return res.toolInstances.map((t: any) => ({
      id: t.id || "unknown",
      toolType: t.toolType || "unknown",
      createdAt: t.createdAt ? new Date(isNaN(+t.createdAt) ? t.createdAt : +t.createdAt) : new Date(),
      ownerID: t.ownerId || "unknown",
      name: t.name || "Untitled Project",
    }));
  }).catch(err => {
    console.error("[FilesLoader] gqlRequest failed for toolInstances:", err);
    // Include specific error message if available from GraphQL
    const message = err.message || (err.errors && err.errors[0]?.message) || "Unknown error";
    throw new Error(message);
  });


  return defer({
    receivedInvitations,
    pendingInvitations,
    toolInstances,
  });
};



export const InvitationsTabArea: React.FC = () => {
  return (
    <>
      <h2 className="w-full my-6 mt-0 capitalize text-fg">invitations</h2>
      <InvitationsTab />
    </>
  );
};

export const ArchivedProjectsArea: React.FC = () => {
  return (
    <aside className="flex flex-col w-full starred-projects align-center h-max min-h-[40rem] flex-1">

      <InvitationsTabArea />

      <h2 className="w-full my-6 capitalize text-fg">archived projects</h2>

      <ul className="flex flex-col items-start justify-start flex-1 w-full list-none border-l-8 border-l-accent h-max">
        <li className="group-file1 flex justify-start w-[95%] h-12 relative">
          <span className="flex items-center justify-center w-12 h-full">
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#folder"></use>
            </svg>
          </span>
          <p className="w-[20rem] h-[2rem] text-ellipsis self-center text-sm px-4 truncate">
            new_file_title_1_on_the_first_longest_line.pct
          </p>

          <DropdownMenu>
            <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
              <button className="flex items-center justify-center w-12 h-full text-mutedFG">
                <svg className="h-2 w-4 cursor-pointer">
                  <use xlinkHref="#kebab"></use>
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
              <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                rename file
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                add to favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                delete file
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
        <li className="group-file1 flex justify-start w-[95%] h-12 relative">
          <span className="flex items-center justify-center w-12 h-full">
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#folder"></use>
            </svg>
          </span>
          <p className="w-[20rem] h-[2rem] text-ellipsis inline-flex flex-col justify-center self-center text-sm px-4">
            new_file_title_2.pct
          </p>

          <DropdownMenu>
            <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
              <button className="flex items-center justify-center w-12 h-full text-mutedFG">
                <svg className="h-2 w-4 cursor-pointer">
                  <use xlinkHref="#kebab" className=""></use>
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
              <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                rename file
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                add to favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer">
                delete file
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>


      <div className="w-[95%] h-max group/settings-pane overflow-visible flex relative">
        <div className="w-full peer/settings-bar p-2 px-4 rounded-md bg-transparent h-[3rem] ring-outline1 ring-1 flex items-center justify-evenly mt-4 ring-offset-2 group-has-[button:focus]/settings-pane:border-2">
          <button className="toggle flex items-center justify-center w-4 h-4 focus:outline-none">
            <svg className="w-full scale-75 md:scale-50">
              <use xlinkHref="#double-caret"></use>
            </svg>
          </button>
          <p className="flex-1 mx-8 text-center"> General settings </p>
          <button className="flex items-center justify-center w-4 h-4">
            <svg className="w-full">
              <use xlinkHref="#moon"></use>
            </svg>
          </button>
        </div>

        <div className="absolute w-full ring-1 ring-outline1 h-max bottom-[100%] z-9 block bg-canvas rounded-tr-md rounded-tl-md py-4 px-8 scale-y-0 origin-bottom peer-has-[button.toggle:focus]/settings-bar:scale-y-100 transition-all duration-300 focus-within:scale-y-100 focus-visible:scale-y-100">
          <ul className="w-full h-max flex flex-col ring">
            <button className="w-full h-16 ring flex items-center justify-center">
              hello
            </button>
            <button className="w-full h-16 ring flex items-center justify-center">
              hello
            </button>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export const ToolInstanceFile: React.FC<ToolInstanceType> = ({createdAt, id, ownerID, toolType, name}) => {

  return <>
      <li className="h-48 md:h-[20rem] group/list-view-item1 flex justify-start items-center w-full md:w-max relative overflow-visible">
        <span className="y-right-absolute-full w-2 group-hover/list-view-item1:bg-accent/25 md:invisible transition-colors duration-150 translate-x-4"></span>
        <div className="flex-1 flex md:flex-col py-4 h-max md:w-max md:flex-[unset]">
          <div className="w-[5rem] mr-[10%] md:w-[14rem] md:h-full h-[5rem] flex md:mb-4 relative group/toolinstance-folder">
            <img
              src="/public/icons/inner-file.svg"
              alt="the icon image representing a big uncolored innner folder"
              className="w-[60%] h-[80%] drop-shadow-lg absolute top-[0.5rem] group-hover/toolinstance-folder:top-[0rem] left-[15%] ease-out duration-200 delay-150"
            />
            <img
              src="/public/icons/big-colored-folder.png"
              alt="the icon image representing a big colored folder"
              className="w-[80%] h-[80%] aspect-square drop-shadow-lg relative"
            />
          </div>

          <div className="flex-1 flex flex-col items-start justify-center">
            <h2 className="font-semibold text-lg">{name}</h2>
            <p className="font-medium text-outline1d">
              last saved {(() => {
                try {
                  if (!createdAt) return "recently";
                  const date = new Date(isNaN(+createdAt) ? createdAt : +createdAt);
                  if (isNaN(date.getTime())) return "recently";
                  
                  const now = new Date();
                  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
                  
                  if (diffMinutes < 1) return "just now";
                  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
                  
                  const diffHours = Math.floor(diffMinutes / 60);
                  if (diffHours < 24) return `${diffHours} hours ago`;
                  
                  return date.toLocaleDateString();
                } catch (e) {
                  return "recently";
                }
              })()}
            </p>
          </div>
        </div>

        <div className="h-full ml-auto justify-self-end md:justify-self-start flex-1 flex items-center justify-center max-w-[4rem] w-[4rem]">
          <img
            src="/images/emoji_student_1.png"
            alt="the image representing the author of a file"
            className="h-[4rem] w-[4rem] aspect-square rounded-full"
          />
        </div>
      </li>
  </>
}

export const FileListView: React.FC = () => {
  const { toolInstances } = useLoaderData<typeof clientLoader>();

  return (
    <ul className="flex md:grid flex-col md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(25rem,1fr))] justify-start md:justify-normal items-center w-[95%] md:w-[98%] mx-auto mt-20  min-w-[80vw] md:min-w-[70vw] mb-20">
      <Suspense fallback={<p className="text-secondaryText px-8">Loading your projects...</p>}>
        <Await 
          resolve={toolInstances} 
          errorElement={<p className="text-red-500 px-8">Error loading projects. Check console for details.</p>}
        >
          {(resolvedTools: ToolInstanceType[]) => (
            <>
              {resolvedTools.map((tool) => (
                <ToolInstanceFile key={tool.id} {...tool} />
              ))}
            </>
          )}
        </Await>
      </Suspense>
    </ul>
  );
};

export const ProjectTabLinks: React.FC = () => {
  return (
    <nav className="w-full h-12 mt-20">
      <ul className="flex items-center justify-center h-full gap-4 mx-auto w-max basis-16">
        <li className="w-[10rem] p-2 px-4 rounded-md hover:bg-[conic-gradient(at_20%_30%,purple_20%,rgb(var(--accent-color))_60%,rgb(var(--accent-color)))] bg-[conic-gradient(at_center,purple_30%,rgb(var(--accent-color)),purple)] text-center ring-2 ring-offset-2 cursor-pointer transition-colors duration-700 ease-linear">
          <Link to={""} className="text-canvas">
            recently viewed
          </Link>
        </li>
        <li className="w-[10rem] p-2 px-4 rounded-md bg-outline1/20 text-center hover:bg-outline1/50 transition-colors duration-500 cursor-pointer">
          <Link to={""}>shared</Link>
        </li>
        <li className="w-[10rem] p-2 px-4 rounded-md bg-outline1/20 text-center hover:bg-outline1/50 transition-colors duration-500 cursor-pointer">
          <Link to={""}>all files</Link>
        </li>
      </ul>
    </nav>
  );
};

export const DBSchemaDesignButton: React.FC = () => {
  return (
    <li className="group/opt-area-1 flex justify-start items-center even:justify-end h-[8rem] md:h-1/2 overflow-hidden max-w-[25rem] md:max-w-[22rem] md:mx-0 mx-auto mb-16 md:mb-0 rounded-lg ring-1 ring-outline1 bg-[#f8f8f8]/90 hover:bg-[#D70DB6] transition-all duration-200">
      <Form method="post" className="w-full h-full">
        <input type="hidden" name="intent" value="CREATE_SCHEMA_DESIGN" />
        <button
          type="submit"
          className="flex items-center justify-start w-full h-full p-4 px-8 focus:outline-none"
        >
          <div className="h-14 w-14 min-h-14 min-w-14 bg-[#D70DB6] rounded-[50%] mr-4 group-hover/opt-area-1:bg-canvas flex items-center justify-center">
            <svg className="w-1/2 stroke-canvas h-1/2 group-hover/opt-area-1:stroke-[#D70DB6]">
              <use xlinkHref="#design"></use>
            </svg>
          </div>
          <div className="select-none text-left">
            <h2 className="text-lg font-medium group-hover/opt-area-1:text-canvas">
              DB Schema Design
            </h2>
            <p className="text-sm group-hover/opt-area-1:text-canvas opacity-80">
              forward engineer a new db schema
            </p>
          </div>
        </button>
      </Form>
    </li>
  );
};


export const ProjectOptionsArea: React.FC = () => {
  return (
    <ul className="project-options-area w-full min-w-[80vw] md:min-w-[70vw] xs:flex sm:grid gap-0 md:gap-4 grid-cols-2 h-max min-h-[30rem] self-start items-center">

      <DBSchemaDesignButton/>

      <li className="group/opt-area-2 flex justify-start items-center even:justify-end h-[8rem] md:h-1/2 overflow-hidden p-4 px-8 max-w-[25rem] md:max-w-[22rem] md:mx-0 mx-auto mb-16 md:mb-0 rounded-lg ring-1 ring-outline1 bg-[#f8f8f8]/90 hover:bg-[#0DD7B2] transition-all duration-200">
        <div className="flex items-center justify-start w-full h-full">
          <div className="h-14 w-14 min-h-14 min-w-14 bg-[#0DD7B2] rounded-[50%] mr-4 group-hover/opt-area-2:bg-canvas">
            <span className="flex items-center justify-center w-full h-full">
              <svg className="w-1/2 stroke-canvas h-1/2 group-hover/opt-area-2:stroke-[#0DD7B2]">
                <use xlinkHref="#pencil"></use>
              </svg>
            </span>
          </div>
          <div className="select-none">
            <h2 className="text-lg font-medium group-hover/opt-area-2:text-canvas">
              Whiteboarding
            </h2>
            <p className="text-sm group-hover/opt-area-2:text-canvas">
              create a new whiteboard for planning
            </p>
          </div>
        </div>
      </li>

      <li className="group/opt-area-3 flex justify-start items-center even:justify-end h-[8rem] md:h-1/2 overflow-hidden p-4 px-8 max-w-[25rem] md:max-w-[22rem] md:mx-0 mx-auto mb-16 md:mb-0 rounded-lg ring-1 ring-outline1 bg-[#f8f8f8]/90 hover:bg-[#4E0DD7] transition-all duration-200">
        <div className="flex items-center justify-start w-full h-full">
          <div className="h-14 w-14 min-h-14 min-w-14 bg-[#4E0DD7] rounded-[50%] mr-4 group-hover/opt-area-3:bg-canvas">
            <span className="flex items-center justify-center w-full h-full">
              <svg className="w-1/2 stroke-canvas h-1/2 group-hover/opt-area-3:stroke-[#4E0DD7]">
                <use xlinkHref="#book"></use>
              </svg>
            </span>
          </div>
          <div className="select-none">
            <h2 className="text-lg font-medium group-hover/opt-area-3:text-canvas">
              Note Taking
            </h2>
            <p className="text-sm group-hover/opt-area-3:text-canvas">
              your memory assistant and a lot more
            </p>
          </div>
        </div>
      </li>

      <li className="group/opt-area-4 flex justify-start items-center even:justify-end h-[8rem] md:h-1/2 overflow-hidden p-4 px-8 max-w-[25rem] md:max-w-[22rem] md:mx-0 mx-auto mb-16 md:mb-0 rounded-lg ring-1 ring-outline1 bg-[#f8f8f8]/90 hover:bg-[#B1B1B1] transition-all duration-200 w-full">
        <div className="flex items-center justify-start w-full h-full">
          <div className="h-14 w-14 min-h-14 min-w-14 bg-[#B1B1B1] rounded-[50%] mr-4 group-hover/opt-area-4:bg-canvas">
            <span className="flex items-center justify-center w-full h-full">
              <svg className="w-1/2 stroke-canvas h-1/2 group-hover/opt-area-4:stroke-[#B1B1B1]">
                <use xlinkHref="#import-curved"></use>
              </svg>
            </span>
          </div>
          <div className="select-none">
            <h2 className="text-lg font-medium group-hover/opt-area-4:text-canvas">
              Import
            </h2>
            <p className="text-sm group-hover/opt-area-4:text-canvas">
              import locally saved projects
            </p>
          </div>
        </div>
      </li>
    </ul>
  );
};

export const FilesPage: React.FC = () => {
  const [windowSize, setWindowSize] = useState<number>(window.innerWidth);

  const handleResize = () => {
    setWindowSize(window.innerWidth);
  };

  useEventListener("resize", handleResize, window as HTMLElement | any);

  return (
    <>
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
    </>
  );
};

export default FilesPage;

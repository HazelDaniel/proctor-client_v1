import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ResetIcon } from "@radix-ui/react-icons";
import { workspaceSelectors } from "~/store";
import { closeSidePane, openSidePane } from "~/reducers/workspace.reducer";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useCollaboration } from "~/contexts/collaboration.context";
import { UnknownAction } from "@reduxjs/toolkit";
import { SQLOutputPane } from "./sql-output-pane";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, useActionData, useNavigation, useFetcher, useNavigate } from "@remix-run/react";
import { Loader2, MessageSquare } from "lucide-react";
import { toggleChat } from "~/reducers/chat.reducer";

export interface WorkspaceHeaderProps {
  initialName?: string;
  instanceId?: string;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ initialName, instanceId }) => {
  const { sidePane: sidePaneVisible } = useSelector(workspaceSelectors);
  const fetcher = useFetcher();

  const dispatch = useDispatch<UnknownAction | any>();
  const sidePaneOpened = sidePaneVisible;

  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState(initialName || "untitled_project");

  // Active viewer presence
  const { socket } = useCollaboration();
  const [viewers, setViewers] = useState<{ userId: string; avatarUrl: string | null }[]>([]);

  // Sync state with props when they change (e.g. initial load)
  useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  const isSubmitting =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "INVITE_COLLABORATOR";

  useEffect(() => {
    if (actionData?.success) {
      setIsInviteOpen(false);
    }
  }, [actionData]);

  // Subscribe to presence:viewers
  useEffect(() => {
    if (!socket) return;
    const onViewers = (data: { viewers: { userId: string; avatarUrl: string | null }[] }) => {
      setViewers(data.viewers);
    };
    socket.on('presence:viewers', onViewers);
    return () => { socket.off('presence:viewers', onViewers); };
  }, [socket]);

  const toggleSidePane = useCallback(() => {
    if (sidePaneOpened) {
      dispatch(closeSidePane());
      return;
    }
    dispatch(openSidePane());
  }, [sidePaneOpened]);

  const handleRename = () => {
    if (!instanceId || name === initialName) return;
    
    // Optimistic update handled by local state 'name', fetcher submits in background
    const formData = new FormData();
    formData.set("intent", "RENAME_TOOL_INSTANCE");
    formData.set("instanceId", instanceId);
    formData.set("name", name);
    fetcher.submit(formData, { method: "post" });
  };

  console.log("viewers are ", viewers);

  return (
    <header className="workspace-header flex items-center justify-start w-full h-32 md:h-20 px-4 pr-0 bg-gradient-to-b from-bg from-80% backdrop-blur-sm fixed z-[95]">
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
        <fetcher.Form method="post" onSubmit={(e) => { e.preventDefault(); handleRename(); }}>
           <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            className="bg-transparent outline-none fixed md:static top-32 md:top-0  x-centered-absolute text-center font-semibold focus:ring-1 focus:ring-outline1 rounded-md"
          />
        </fetcher.Form>
      </div>

      <div className="w-[15rem] flex justify-between items-center mx-auto md:mx-0">
        <ul className="w-max flex h-8">
          {viewers.slice(0, 3).map((v) => (
            <li key={v.userId} className="w-8 h-8 rounded-full drop-shadow-md rotate-[-3deg] mx-[-0.3rem] select-none overflow-hidden">
              <img
                src={v.avatarUrl || "/images/emoji_student_1.png"}
                alt="active viewer"
                className="w-full h-full object-cover"
              />
            </li>
          ))}
          {viewers.length > 3 && (
            <li className="w-8 h-8 rounded-full drop-shadow-md bg-canvas mx-[-0.3rem] select-none">
              <span className="w-full h-full flex items-center justify-center text-sm font-medium">
                +{viewers.length - 3}
              </span>
            </li>
          )}
          {viewers.length === 0 && (
            <li className="w-8 h-8 rounded-full drop-shadow-md bg-canvas mx-[-0.3rem] select-none opacity-40">
              <span className="w-full h-full flex items-center justify-center text-xs">—</span>
            </li>
          )}
        </ul>

        <span 
          className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-outline1/50 rounded transition-colors tooltip"
          title="Toggle Project Chat"
          onClick={() => dispatch(toggleChat())}
        >
          <MessageSquare className="w-5 h-5 text-primary opacity-80" />
        </span>

        <span className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-outline1/50 rounded transition-colors" title="Export">
          <svg className="w-[80%] h-[80%]">
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
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="rounded-sm p-4 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  invite collaborator
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-canvas ring-1 ring-outline1">
                <DialogHeader>
                  <DialogTitle>Invite Collaborator</DialogTitle>
                  <DialogDescription>
                    Enter the email address of the person you'd like to invite to
                    this project.
                  </DialogDescription>
                </DialogHeader>
                <Form method="post" className="flex flex-col gap-4">
                  <input
                    type="hidden"
                    name="intent"
                    value="INVITE_COLLABORATOR"
                  />
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      id="email"
                      placeholder="colleague@example.com"
                      className="flex h-10 w-full rounded-md border border-outline1 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-mutedFG focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  {actionData?.error && (
                    <p className="text-sm font-medium text-danger">
                      {actionData.error}
                    </p>
                  )}
                  <DialogFooter className="sm:justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-accent text-white hover:bg-accent/90 h-10 px-4 py-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Invitation"
                      )}
                    </button>
                  </DialogFooter>
                </Form>
              </DialogContent>
            </Dialog>

            <DropdownMenuSeparator className="bg-outline1 w-full h-[1px]" />
            <DropdownMenuItem className="rounded-sm p-4 cursor-pointer">
              record session
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-outline1 w-full h-[1px]" />
            <DropdownMenuItem 
              className="rounded-sm p-4 cursor-pointer text-danger"
              onSelect={() => {
                // Navigating away from the route unmounts CollaborationProvider,
                // which automatically triggers its cleanup (socket.disconnect(), doc cleanup).
                navigate("/files");
              }}
            >
              leave session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SQLOutputPane />
    </header>
  );
};

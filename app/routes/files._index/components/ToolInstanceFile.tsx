import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useFetcher } from "@remix-run/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { gqlRequest } from "~/utils/api";
import { toast } from "sonner";
import { ToolInstanceType } from "~/types";

export const ToolInstanceFile: React.FC<ToolInstanceType> = ({ createdAt, id, ownerID, toolType, name }) => {
  const fetcher = useFetcher();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const hasFetchedAvatar = useRef(false);

  const optimisticName =
    fetcher.formData?.has("name") && fetcher.formData.get("intent") === "RENAME_TOOL_INSTANCE"
      ? String(fetcher.formData.get("name"))
      : name;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleRecordAccess = () => {
    fetcher.submit({ intent: "RECORD_TOOL_ACCESS", instanceId: id }, { method: "post" });
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const avatarObserverRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hasFetchedAvatar.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !hasFetchedAvatar.current) {
            hasFetchedAvatar.current = true;
            observer.disconnect();

            gqlRequest(
              `
              query FetchUserAvatarUrl($userId: String!) {
                fetchUserAvatarUrl(userId: $userId)
              }
            `,
              { userId: ownerID },
            )
              .then((data) => {
                if (data.fetchUserAvatarUrl) {
                  setAvatarUrl(data.fetchUserAvatarUrl);
                }
              })
              .catch((err) => {
                toast.error("Failed to fetch user avatar");
                console.warn("[ToolInstanceFile] Failed to fetch avatar:", err);
              });
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(node);
    },
    [ownerID],
  );

  return (
    <li className="h-48 md:h-[20rem] group/list-view-item1 flex justify-start items-center w-full md:w-max relative overflow-hidden">
      <span className="y-right-absolute-full w-2 group-hover/list-view-item1:bg-accent/25 md:invisible transition-colors duration-150 translate-x-4"></span>
      <div className="flex-1 flex md:flex-col py-4 h-max md:w-max md:flex-[unset]">
        <div className="w-[5rem] mr-[10%] md:w-[14rem] md:h-full h-[5rem] flex md:mb-4 relative group/toolinstance-folder">
          <img
            src="/public/icons/inner-file.svg"
            alt="the icon image representing a big uncolored innner folder"
            className="w-[60%] h-[80%] drop-shadow-lg absolute top-[0.5rem] group-hover/toolinstance-folder:top-[0rem] left-[15%] ease-out duration-200 delay-150"
          />
          <Link to={`/files/${id}`} onClick={handleRecordAccess} className="w-[80%] h-[80%] aspect-square drop-shadow-lg relative">
            <img src="/public/icons/big-colored-folder.png" alt="the icon image representing a big colored folder" className="size-full" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none absolute top-0 w-12 size-8 right-[-3rem]">
              <button className="flex items-center justify-center size-full text-mutedFG ">
                <svg className="h-2 w-4 cursor-pointer">
                  <use xlinkHref="#kebab"></use>
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-accent bg-primary/20 backdrop-blur-[10px]">
              <DropdownMenuItem
                className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer text-primary hover:text-canvas"
                onSelect={() => setIsEditing(true)}
              >
                rename file
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer text-primary hover:text-canvas"
                onSelect={() => {
                  const formData = new FormData();
                  formData.set("intent", "ARCHIVE_TOOL_INSTANCE");
                  formData.set("instanceId", id);
                  fetcher.submit(formData, { method: "post" });
                }}
              >
                archive file
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer text-red-500 hover:text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    delete file
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="z-[50] sm:max-w-md bg-canvas ring-1 ring-outline1">
                  <DialogHeader>
                    <DialogTitle>Delete File</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="sm:justify-end gap-2">
                    <DialogClose asChild>
                      <button className="px-4 py-2 rounded-md ring-1 ring-outline1 hover:bg-accent/10">
                        Cancel
                      </button>
                    </DialogClose>
                    <button
                      className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => {
                        const formData = new FormData();
                        formData.set("intent", "DELETE_TOOL_INSTANCE");
                        formData.set("instanceId", id);
                        fetcher.submit(formData, { method: "post" });
                        setIsDeleteDialogOpen(false);
                      }}
                    >
                      Delete
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 flex flex-col items-start justify-center">
          <>
            <fetcher.Form className={`${isEditing ? "flex" : "hidden"}`} method="post" onSubmit={() => setIsEditing(false)} onBlur={(e) => {
               if (e.currentTarget instanceof HTMLFormElement) {
                  fetcher.submit(e.currentTarget);
               }
               setIsEditing(false);
            }}>
                <input type="hidden" name="intent" value="RENAME_TOOL_INSTANCE" />
                <input type="hidden" name="instanceId" value={id} />
                <input 
                  type="text" 
                  name="name" 
                  ref={inputRef}
                  defaultValue={name} 
                  className={`font-semibold text-primary/80 text-lg bg-transparent border border-accents-500 focus:outline-none w-[80%] px-2`}
                  id={`tool-instance-${id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                    }
                  }}
                />
            </fetcher.Form>
            <h2 className={`${isEditing ? "hidden" : "block font-semibold text-lg w-[10rem] truncate"}`}>{optimisticName}</h2>
        </>
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

      <div ref={avatarObserverRef} className="h-full ml-[2rem] justify-self-end md:justify-self-start flex-1 flex items-center justify-center max-w-[4rem] w-[4rem]">
        {avatarUrl ? (
          <img src={avatarUrl} alt="the image representing the author of a file" className="h-[4rem] w-[4rem] aspect-square rounded-full object-cover" />
        ) : (
          <span className="h-[4rem] w-[4rem] aspect-square rounded-full bg-outline1/20 flex items-center justify-center">
            <svg className="w-1/2 h-1/2 opacity-40">
              <use xlinkHref="#profile"></use>
            </svg>
          </span>
        )}
      </div>
    </li>
  );
};

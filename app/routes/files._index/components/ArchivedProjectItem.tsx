import React, { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { useFetcher } from "@remix-run/react";
import { ToolInstanceType } from "~/types";

export const ArchivedProjectItem: React.FC<{ project: ToolInstanceType }> = ({ project }) => {
  const fetcher = useFetcher();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <li className="group-file1 flex justify-start w-[95%] h-12 relative hover:bg-black/5 transition-colors rounded-sm">
      <span className="flex items-center justify-center w-12 h-full">
        <svg className="w-full h-full scale-75">
          <use xlinkHref="#folder"></use>
        </svg>
      </span>
      <p className="w-[15rem] md:w-[20rem] h-[2rem] text-ellipsis self-center text-sm px-4 truncate font-medium text-fg/80">
        {project.name}
      </p>

      <div className="ml-auto mr-2 h-full flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none opacity-50 group-hover-file1:opacity-100">
            <button className="flex items-center justify-center w-8 h-8 text-mutedFG hover:bg-black/10 rounded-full">
              <svg className="h-2 w-4 cursor-pointer">
                <use xlinkHref="#kebab"></use>
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-10 h-max w-max rounded-sm p-4 ring-1 ring-outline1 bg-canvas">
            <DropdownMenuItem
              className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer"
              onSelect={() => {
                const formData = new FormData();
                formData.set("intent", "UNARCHIVE_TOOL_INSTANCE");
                formData.set("instanceId", project.id);
                fetcher.submit(formData, { method: "post" });
              }}
            >
              Unarchive
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="focus:bg-none text-sm focus:outline-none capitalize h-8 cursor-pointer text-red-500 hover:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  Delete file
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-canvas ring-1 ring-outline1">
                <DialogHeader>
                  <DialogTitle>Delete Project</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to permanently delete <strong>{project.name}</strong>? This action cannot be undone.
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
                      formData.set("instanceId", project.id);
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
    </li>
  );
};

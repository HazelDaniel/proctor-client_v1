import React, { Suspense } from "react";
import { Await, useLoaderData } from "@remix-run/react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "~/components/ui/skeleton";
import { toggleTheme } from "~/reducers/workspace.reducer";
import { RootState } from "~/store";
import { ToolInstanceType } from "~/types";
import { ArchivedProjectItem } from "./ArchivedProjectItem";
import { InvitationsTabArea } from "./InvitationsTabArea";

export const ArchivedProjectsArea: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.workspace.theme);

  return (
    <aside className="flex flex-col w-full starred-projects align-center h-max min-h-[40rem] flex-1">
      <InvitationsTabArea />

      <h2 className="w-full my-6 capitalize text-fg">archived projects</h2>

      <ul className="flex flex-col items-start justify-start flex-1 w-full list-none border-l-8 border-l-accent h-max min-h-[5rem]">
        <Suspense
          fallback={
            <>
              <Skeleton className="h-12 w-[95%] mb-2 rounded-sm mx-auto" />
              <Skeleton className="h-12 w-[95%] mb-2 rounded-sm mx-auto" />
            </>
          }
        >
          <Await resolve={useLoaderData().archivedProjects} errorElement={<p className="text-red-500 px-4">Failed to load archived projects.</p>}>
            {(archived: ToolInstanceType[]) =>
              archived.length === 0 ? (
                <p className="text-mutedFG px-4 py-2 text-sm mx-auto">No archived projects</p>
              ) : (
                archived.map((project) => <ArchivedProjectItem key={project.id} project={project} />)
              )
            }
          </Await>
        </Suspense>
      </ul>

      <div className="w-[95%] h-max group/settings-pane overflow-visible flex relative">
        <div className="w-full h-max group/settings-pane overflow-visible flex relative mt-auto">
          <div className="w-full peer/settings-bar p-2 px-4 rounded-md bg-transparent h-[3rem] ring-outline1 ring-1 flex items-center justify-evenly mt-4 ring-offset-2 group-has-[button:focus]/settings-pane:border-2">
            <button className="show flex items-center justify-center w-4 h-4 focus:outline-none">
              <svg className="w-full scale-75 md:scale-50">
                <use xlinkHref="#double-caret"></use>
              </svg>
            </button>
            <p className="flex-1 mx-8 text-center"> General settings </p>
            <button
              className="flex items-center justify-center w-4 h-4 hover:scale-110 transition-transform"
              onClick={() => dispatch(toggleTheme())}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              <svg className="w-full">
                <use xlinkHref={theme === "light" ? "#moon" : "#sun"}></use>
              </svg>
            </button>
          </div>
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

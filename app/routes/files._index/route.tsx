import { ClientLoaderFunctionArgs, json } from "@remix-run/react";
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

export const meta: MetaFunction = () => {
  return [
    { title: "files | proctor" },
    { name: "description", content: "proctor files page" },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return json({});
};

export const StarredProjectsArea: React.FC = () => {
  return (
    <aside className="flex flex-col w-full starred-projects align-center h-max min-h-[40rem]">
      <h2 className="w-full mb-10 capitalize text-fg">starred projects</h2>

      <ul className="flex flex-col items-start justify-start flex-1 w-full list-none border-l-8 border-l-accent h-max">
        <li className="group-file1 flex justify-start w-[95%] h-12 has-[button:focus]:before:w-full  has-[button:focus]:before:h-0.5  has-[button:focus]:before:bg-accent/25  has-[button:focus]:before:absolute has-[button:focus]:before:bottom-0 relative">
          <span className="flex items-center justify-center w-12 h-full">
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#folder"></use>
            </svg>
          </span>
          <p className="w-[20rem] h-[2rem] text-ellipsis self-center text-sm px-4 truncate">
            new_file_title_1_on_the_first_longest_line.pct
          </p>
          <button className="flex items-center justify-center w-12 h-full">
            <svg className="w-full h-full scale-50 cursor-pointer">
              <use xlinkHref="#kebab"></use>
            </svg>
          </button>
        </li>
        <li className="group-file1 flex justify-start w-[95%] h-12 has-[button:focus]:before:w-full  has-[button:focus]:before:h-0.5  has-[button:focus]:before:bg-accent/25  has-[button:focus]:before:absolute has-[button:focus]:before:bottom-0 relative">
          <span className="flex items-center justify-center w-12 h-full">
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#folder"></use>
            </svg>
          </span>
          <p className="w-[20rem] h-[2rem] text-ellipsis inline-flex flex-col justify-center self-center text-sm px-4">
            new_file_title_2.pct
          </p>
          <button className="flex items-center justify-center w-12 h-full">
            <svg className="w-full h-full scale-50 cursor-pointer">
              <use xlinkHref="#kebab"></use>
            </svg>
          </button>
        </li>
      </ul>
      <div className="w-[95%] p-2 px-4 rounded-md bg-transparent h-[3rem] ring-outline1 ring-1 flex items-center justify-evenly">
        <button className="flex items-center justify-center w-4 h-4">
          <svg className="w-full scale-75 md:scale-50">
            <use xlinkHref="#double-caret"></use>
          </svg>
        </button>
        <p className="flex-1 mx-8 text-center"> General settings </p>
        <button className="flex items-center justify-center w-4 h-4">
          <svg className="w-full">
            <use xlinkHref="#gear"></use>
          </svg>
        </button>
      </div>
    </aside>
  );
};

export const ProjectTabLinks: React.FC = () => {
  return (
    <nav className="w-full h-12">
      <ul className="flex items-center justify-center h-full gap-4 mx-auto w-max">
        <li>recently viewed</li>
        <li>recently viewed</li>
        <li>recently viewed</li>
      </ul>
    </nav>
  );
};

export const ProjectOptionsArea: React.FC = () => {
  return (
    <ul className="project-options-area w-full min-w-[80vw] md:min-w-[70vw] xs:flex sm:grid gap-0 md:gap-4 grid-cols-2 h-max min-h-[30rem] self-start items-center">
      <li className="group/opt-area-1 flex justify-start items-center even:justify-end h-[8rem] md:h-1/2 overflow-hidden p-4 px-8 max-w-[25rem] md:max-w-[22rem] md:mx-0 mx-auto mb-16 md:mb-0 rounded-lg ring-1 ring-outline1 bg-[#f8f8f8]/90 hover:bg-[#D70DB6] transition-all duration-200">
        <div className="flex items-center justify-start w-full h-full">
          <div className="h-14 w-14 min-h-14 min-w-14 bg-[#D70DB6] rounded-[50%] mr-4 group-hover/opt-area-1:bg-canvas">
            <span className="flex items-center justify-center w-full h-full">
              <svg className="w-1/2 stroke-canvas h-1/2 group-hover/opt-area-1:stroke-[#D70DB6]">
                <use xlinkHref="#design"></use>
              </svg>
            </span>
          </div>
          <div className="select-none">
            <h2 className="text-lg font-medium group-hover/opt-area-1:text-canvas">
              DB Schema Design
            </h2>
            <p className="text-sm group-hover/opt-area-1:text-canvas">
              forward engineer a new db schema
            </p>
          </div>
        </div>
      </li>

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
              <StarredProjectsArea />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex flex-col items-center justify-start h-full p-6">
              <ProjectOptionsArea />
              <ProjectTabLinks />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </>
  );
};

export default FilesPage;

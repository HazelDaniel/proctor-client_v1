import React from "react";
import { DBSchemaDesignButton } from "./DBSchemaDesignButton";

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

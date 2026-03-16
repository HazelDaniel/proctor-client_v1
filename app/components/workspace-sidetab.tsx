import { Link } from "@remix-run/react";
import React from "react";
import { useSelector } from "react-redux";
import {
  setCloseCommentsPane,
  setCloseDesignPane,
  setCloseOutputPane,
  setOpenCommentsPane,
  setOpenDesignPane,
  setOpenOutputPane,
} from "~/reducers/workspace.reducer";
import { sidePaneSelector } from "~/store";
import { PaneSettingsFlag } from "~/components/pane-settings-flag";

export const WorkspaceSidetab: React.FC = () => {
  const sidePaneOpened = useSelector(sidePaneSelector);
  return (
    <div
      className={
        "w-[30rem] max-w-[100vw] h-[90vh] md:h-[100vh] fixed z-[15] bg-bg rounded-sm border-t-4 border-t-accent/50 top-[6rem] md:top-[4.5rem] *:select-none" +
        `${!sidePaneOpened ? " left-[-100vw]" : ""}`
      }
    >
      <div className="wrapper flex flex-col justify-between w-full h-full overflow-y-auto p-2 py-8  ">
        <div className="flex flex-col justify-start align-center w-full h-max">
          <div className="flex flex-col w-full my-4">
            <p className="ring-1 ring-outline1 rounded-sm w-full px-4 font-medium">
              File options
            </p>
            <ul className="h-max font-medium w-full rounded-md bg-canvas mt-2 p-4 pt-8 before:w-[99%] before:x-centered-absolute before:h-[2px] before:bg-outline1/90 before:top-4 before:rounded-lg relative ring-1 ring-outline1/60">
              <li className="w-full flex justify-between items-center h-8 overflow-hidden capitalize my-2">
                open file
                <span className="w-8 h-8 mr-2 flex items-center">
                  <svg className="w-4 h-4 mr-1">
                    <use xlinkHref="#command"></use>
                  </svg>

                  <span className="text-lg text-outline1d text-opacity-50 opacity-60">
                    O
                  </span>
                </span>
              </li>

              <li className="w-full flex justify-between items-center h-8 overflow-hidden capitalize my-2">
                <Link to={"/files"}>
                    back to files
                </Link>
              </li>

              <li className="w-full flex justify-between items-center h-8 overflow-hidden capitalize my-2">
                save
                <span className="w-8 h-8 mr-2 flex items-center">
                  <svg className="w-4 h-4 mr-1">
                    <use xlinkHref="#command"></use>
                  </svg>

                  <span className="text-lg text-outline1d text-opacity-50 opacity-60">
                    S
                  </span>
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col w-full my-4">
            <p className="ring-1 ring-outline1 rounded-sm w-full px-4 font-medium">
              View options
            </p>
            <ul className="h-max font-medium w-full rounded-md bg-canvas mt-2 p-4 pt-8 before:w-[99%] before:x-centered-absolute before:h-[2px] before:bg-outline1/90 before:top-4 before:rounded-lg relative ring-1 ring-outline1/60">
              <PaneSettingsFlag
                checkAction={setOpenCommentsPane()}
                command="J"
                text="show comments pane"
                matchingActionText="commentsPane"
                uncheckAction={setCloseCommentsPane()}
              />

              <PaneSettingsFlag
                checkAction={setOpenOutputPane()}
                command="E"
                text="show output pane"
                matchingActionText="outputPane"
                uncheckAction={setCloseOutputPane()}
              />

              <PaneSettingsFlag
                checkAction={setOpenDesignPane()}
                command="-"
                text="show design pane"
                matchingActionText="designPane"
                uncheckAction={setCloseDesignPane()}
              />

              <li className="w-full flex justify-between items-center h-8 overflow-hidden capitalize my-2">
                <input
                  type="checkbox"
                  name=""
                  id="show-all"
                  className="inline accent-accent mr-4"
                />
                <label htmlFor="show-all" className="mr-auto">
                  show all panes
                </label>
                <span className="w-8 h-8 mr-2 flex items-center">
                  <svg className="w-4 h-4 mr-1">
                    <use xlinkHref="#command"></use>
                  </svg>

                  <span className="text-lg text-outline1d text-opacity-50 opacity-60">
                    \
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

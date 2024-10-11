import { Background, Controls, Panel, ReactFlow, ViewportPortal } from "@xyflow/react";
import { useSelector } from "react-redux";
import { settingsSelector } from "~/store";

const nodes = [
  {
    id: "1",
    data: { label: "Hello" },
    position: { x: 0, y: 0 },
    type: "input",
  },
  {
    id: "2",
    data: { label: "World" },
    position: { x: 100, y: 100 },
  },
];

export const chatBubble: React.FC = () => {
  return (
    <ViewportPortal>
      <div
        style={{ transform: 'translate(100px, 100px)', position: 'absolute' }}
      >
        This div is positioned at [100, 100] on the flow.
      </div>
    </ViewportPortal>
  );
}

const DesignPanel: React.FC = () => {
  return (
    <div className="design-panel w-max min-w-[25rem] md:min-w-[35rem] h-32 align-center mt-32 relative z-[2] mx-auto flex px-8 border-x-[10px] md:border-r-[20px] md:border-l-[20px] border-accent rounded-lg bg-canvas shadow-md drop-shadow-md shadow-outline1 py-4 z-5">
      <div className="h-full mx-auto bg-outline1/35 w-[8rem] flex flex-col relative items-center justify-end overflow-hidden group/folder-pane-g cursor-pointer *:select-none">
        <img
          src="/icons/shadow-file-bottom.svg"
          alt="icon of a stacked folder"
          className="absolute w-[85%] bottom-[-40%] transition-all group-hover/folder-pane-g:bottom-[-10%] group-hover/folder-pane-g:rotate-[-2deg] origin-bottom ease-in-out"
        />
        <img
          src="/icons/shadow-file-top.svg"
          alt=""
          className="absolute w-[85%] bottom-[-20%] transition-all group-hover/folder-pane-g:bottom-[-10%] group-hover/folder-pane-g:rotate-2 origin-bottom"
        />
      </div>
      <span className="h-full w-[2px] bg-outline1 rounded mx-[2rem]"></span>
      <ul className="flex flex-row items-center h-full gap-4 mx-auto w-max">
        <li className="flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2">
          <div className="w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative">
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#t"></use>
            </svg>
          </div>
        </li>

        <li className="flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2">
          <div className="w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative">
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#grid"></use>
            </svg>
          </div>
        </li>

        <li className="flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2">
          <div className="w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative">
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#comment"></use>
            </svg>
          </div>
        </li>
      </ul>
    </div>
  );
};

export const CanvasPanel: React.FC = () => {
  const settings = useSelector(settingsSelector);
  if (settings.designPane) return (
    <Panel position={"bottom-center"}>
      <DesignPanel />
    </Panel>
  );
  return null;
};

export const DesignCanvas: React.FC = () => {
  return (
    <>
      <ReactFlow nodes={nodes}>
        <Background />
        <CanvasPanel />
        <Controls />
      </ReactFlow>
    </>
  );
};

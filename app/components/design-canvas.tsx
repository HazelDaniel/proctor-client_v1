import {
  Background,
  Controls,
  Panel,
  ReactFlow,
  ViewportPortal,
  XYPosition,
  useReactFlow,
} from "@xyflow/react";
import React, { Children, ReactNode, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "~/hooks/usedebounce";
import { setNodePosition } from "~/reducers/nodes.reducer";
import {
  nodeSelectorMemo,
  nodesSelectorMemo,
  settingsSelector,
  subsetNodesSelectorMemo,
} from "~/store";
import { isEqual } from "~/utils/comparison";

export const ChatBubble: React.FC<{pos: XYPosition}> = ({pos}) => {
  return (
    <ViewportPortal>
      <div className={`floating-portal-item w-8 h-8 bg-accent rounded-full absolute translate-x-[${pos.x}px] translate-y-[${pos.y}px]`}></div>
    </ViewportPortal>
  );
};

export const ChatBubbleViewCtx: React.FC<{children: ReactNode}> = ({children}) => {
  return <>
    {Children}
  </>
}

export const ChatBubbleView: React.FC = () => {
  return <ChatBubbleViewCtx>
    <div></div>
  </ChatBubbleViewCtx>
}

const DesignPanel: React.FC = () => {
  return (
    <div className="design-panel w-max min-w-[25rem] md:min-w-[35rem] h-32 align-center relative z-[2] mx-auto flex px-8 border-x-[10px] md:border-r-[20px] md:border-l-[20px] border-accent rounded-lg bg-canvas shadow-md drop-shadow-md shadow-outline1 py-4 z-5">
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
  if (settings.designPane)
    return (
      <Panel
        position={"bottom-center"}
        className="max-h-max flex flex-col justify-start items-center"
        id="design-panel-parent"
      >
        <DesignPanel />
      </Panel>
    );
  return null;
};

export const DesignCanvas: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const nodes = useSelector(nodesSelectorMemo, isEqual);
  const node = useSelector(nodeSelectorMemo("1"), isEqual);
  const subsetNodes = useSelector(subsetNodesSelectorMemo(["2", "1", "3"]), isEqual);

  console.log("node is ", node);
  console.log("while other nodes  are ", nodes);
  console.log("and subset nodes are ", subsetNodes);

  const onNodesChange = (changes: any) => {
    changes.forEach(({ type, id, position }: any) => {
      if (type === "position" && position) {
        dispatch(setNodePosition({ id: id, position: position }));
      }
    });
  };

  return (
    <>
      <ReactFlow nodes={nodes} onNodesChange={onNodesChange} edges={[]}>
        <Background />
        {/* <ChatBubble pos={}/> */}
        <CanvasPanel />
        <Controls />
      </ReactFlow>
    </>
  );
});

import {
  Background,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowInstance,
  ViewportPortal,
  XYPosition,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import React, {
  Children,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChatBubbleContextValueType,
  chatBubbleContext,
} from "~/contexts/chat-bubble.context";
import {
  DesignPaneContextValueType,
  DesignPaneProvider,
  designPaneContext,
} from "~/contexts/design-pane.context";
import { handleKeyPress } from "~/event-handlers/workspace.handlers";
import { useDebounce } from "~/hooks/usedebounce";
import useEventListener from "~/hooks/useevent";
import { __addBubble, selectChatBubbles } from "~/reducers/chat-bubble.reducer";
import {
  __setActiveTab,
  designPaneReducer,
  initialDesignPaneState,
} from "~/reducers/design-pane.reducer";
import { setNodePosition } from "~/reducers/nodes.reducer";
import {
  nodeSelector,
  nodesSelector,
  settingsSelector,
  subsetNodesSelector,
} from "~/store";
import { StatefulNodeType } from "~/types";
import { isEqual } from "~/utils/comparison";

export const ChatBubble: React.FC<{ pos: XYPosition }> = ({ pos }) => {
  return (
    <div
      className={`floating-portal-item w-8 h-8 bg-accent rounded-full absolute`}
      style={{ "--pos-x": `${pos.x}px`, "--pos-y": `${pos.y}px` } as any}
    ></div>
  );
};

export const ChatBubbleView = React.memo(() => {
  const { chatBubbleState } = useContext(
    chatBubbleContext
  ) as ChatBubbleContextValueType;
  const getBubbles = useCallback(
    (state: typeof chatBubbleState) => selectChatBubbles(state),
    []
  );

  return (
    <ViewportPortal>
      {getBubbles(chatBubbleState).map((bubble) => {
        return <ChatBubble pos={bubble.position} key={bubble.id} />;
      })}
    </ViewportPortal>
  );
});

const DesignPanel: React.FC = React.memo(function DesignPanelInner() {
  const { designPaneDispatch, designPaneState } = useContext(
    designPaneContext
  ) as DesignPaneContextValueType;

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
      <ul className="flex flex-row items-center h-full gap-4 mx-auto w-max relative">
        <li
          className={
            "flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2 has-[.active]:ring-accent transition-all duration-300"
          }
          onClick={(e) => {
            e.stopPropagation();
            designPaneDispatch(__setActiveTab("text"));
          }}
        >
          <div
            className={
              "w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative" +
              `${designPaneState.activeTab === "text" ? " active" : ""}`
            }
          >
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#t"></use>
            </svg>
          </div>
        </li>

        <li
          className={
            "flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2 has-[.active]:ring-accent transition-all duration-300"
          }
          onClick={(e) => {
            e.stopPropagation();
            designPaneDispatch(__setActiveTab("table"));
          }}
        >
          <div
            className={
              "w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative" +
              `${designPaneState.activeTab === "table" ? " active" : ""}`
            }
          >
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#grid"></use>
            </svg>
          </div>
        </li>

        <li
          className={
            "flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2 has-[.active]:ring-accent transition-all duration-300"
          }
          onClick={(e) => {
            e.stopPropagation();
            designPaneDispatch(__setActiveTab("comment"));
          }}
        >
          <div
            className={
              "w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative" +
              `${designPaneState.activeTab === "comment" ? " active" : ""}`
            }
          >
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#comment"></use>
            </svg>
          </div>
        </li>
      </ul>
    </div>
  );
});

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
  // GLOBAL STATE
  const dispatch = useDispatch();
  const nodes = useSelector(nodesSelector, isEqual);

  // CONTEXT STATE
  const { chatBubbleDispatch } = useContext(
    chatBubbleContext
  ) as ChatBubbleContextValueType;

  // LOCAL STATE
  const [instance, setInstance] =
    useState<ReactFlowInstance<StatefulNodeType & { id: string }, never>>();
  const [designPaneState, designPaneDispatch] = useReducer(
    designPaneReducer,
    initialDesignPaneState
  );
  const designPaneValue = useMemo(
    () => ({ designPaneState, designPaneDispatch }),
    [designPaneState, designPaneDispatch]
  );

  const [panPosFrame, setPanPosFrame] = useState<
    [{ x: number; y: number }, { x: number; y: number }]
  >([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  const [shouldCalcFrame, setShouldCalcFrame] = useState<boolean>(true);

  // COMPONENT EVENT HANDLERS
  useEventListener(
    "keyup",
    handleKeyPress(null, (event) => {
      if (!event) return;
      if (event.key === "Escape") designPaneDispatch(__setActiveTab(null));
    }),
    window as unknown as HTMLElement
  );

  const getCanvasPosition = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>) => {
      if (!instance) return { x: undefined, y: undefined };
      let { zoom } = instance.getViewport();

      // now, we get the position delta
      const panPosDeltaX = panPosFrame[1].x - panPosFrame[0].x;
      const panPosDeltaY = panPosFrame[1].y - panPosFrame[0].y;

      console.log(
        `--panPosDeltaX: ${panPosDeltaX}\t panPosDeltaY: ${panPosDeltaY}`
      );

      const canvasParent = document.getElementById(
        "design-canvas-wrapper"
      )! as HTMLDivElement;
      const parentRect = canvasParent.getBoundingClientRect();
      const netEventY = event.clientY - parentRect.y;
      const netEventX = event.clientX - parentRect.x;
      const grainXOffset = 16;
      const grainYOffset = 12;

      // net_node_position = (relative_event_position - (delta(node_position) * zoomFactor)) - error ---- (1)
      // i.e, resulting node position = mouse position - offset between the cursor and the position

      let zoomFactor = zoom; // assuming the zoom level is a positive real

      let x = netEventX - panPosDeltaX * zoomFactor;
      let y = netEventY - -panPosDeltaY * zoomFactor; // the negative

      return { x: x - grainXOffset, y: y - grainYOffset };
    },
    [instance, panPosFrame]
  );

  // FLOW EVENT HANDLERS
  const onPaneClick = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>) => {
      event.stopPropagation();
      setShouldCalcFrame(false);
      switch (designPaneState.activeTab) {
        case "comment": {
          if (!instance) break;
          const { x, y } = getCanvasPosition(event);
          if (!(x && y)) break;
          chatBubbleDispatch(__addBubble({ x, y }));
        }
        default: {
          break;
        }
      }
    },
    [chatBubbleDispatch, instance, panPosFrame, designPaneState.activeTab]
  );

  const onNodesChange = (changes: any) => {
    changes.forEach(({ type, id, position }: any) => {
      if (type === "position" && position) {
        dispatch(setNodePosition({ id: id, position: position }));
      }
    });
  };

  // EFFECTS
  useEffect(() => {
    if (!!designPaneState.activeTab && instance) {
      instance.setViewport({
        x: instance.getViewport().x,
        y: instance.getViewport().y,
        zoom: 1,
      });
    }
  }, [designPaneState.activeTab, instance]);

  console.log("pane offset is ", panPosFrame);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={[]}
        onPaneClick={onPaneClick}
        defaultViewport={{ zoom: 1, x: 0, y: 0 }}
        maxZoom={!!designPaneState.activeTab ? 1 : 4}
        minZoom={!!designPaneState.activeTab ? 1 : 0.25}
        onMoveStart={(event, vp) => {
          if (!shouldCalcFrame || designPaneState.activeTab) return;
          setPanPosFrame((prev) => {
            const [prevStart, end] = prev;
            if (
              prevStart.x === vp.x &&
              prevStart.y === vp.y &&
              !!(prevStart.x & prevStart.y)
            )
              return prev;
            return [{ x: vp.x, y: vp.y ? -vp.y : vp.y }, end];
          });
        }}
        onMoveEnd={(_, vp) => {
          setPanPosFrame((prev) => {
            const [start, _] = prev;
            return [start, { x: vp.x, y: vp.y ? -vp.y : vp.y }];
          });
        }}
        onInit={(instance) => {
          setInstance(instance);
        }}
      >
        <Background />

        <DesignPaneProvider value={designPaneValue}>
          <ChatBubbleView />
          <CanvasPanel />
        </DesignPaneProvider>

        <Controls />
      </ReactFlow>
    </>
  );
});

import {
  Background,
  ConnectionMode,
  Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  NodeToolbar,
  NodeTypes,
  OnConnect,
  Panel,
  Position,
  ReactFlow,
  ReactFlowInstance,
  ViewportPortal,
  XYPosition,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import React, {
  CSSProperties,
  ChangeEvent,
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
  childNodePositionSelector,
  edgesSelector,
  nodeChildrenLengthSelector,
  nodeSelector,
  nodesSelector,
  settingsSelector,
  store,
  subsetNodesSelector,
} from "~/store";
import { StatefulNodeType, statefulNodeColorType } from "~/types";
import { isEqual } from "~/utils/comparison";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { BidirectionalEdge } from "./bidirectional-edge";
import { TableCreationForm } from "./table-creation-form";

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
          <button
            className={
              "w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative" +
              `${designPaneState.activeTab === "text" ? " active" : ""}`
            }
          >
            <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>
            <svg className="w-full h-full scale-75">
              <use xlinkHref="#t"></use>
            </svg>
          </button>
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
          <Dialog>
            <DialogTrigger asChild className="">
              <button
                className={
                  "w-[80%] h-[80%] rounded-md flex items-center justify-center border-outline1/35 border-2 rounded-tr-none relative" +
                  `${designPaneState.activeTab === "table" ? " active" : ""}`
                }
              >
                <span className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 scale-75 origin-center bg-canvas"></span>

                <svg className="w-full h-full scale-75">
                  <use xlinkHref="#grid"></use>
                </svg>
              </button>
            </DialogTrigger>
            <DialogContent className="w-[80vw] min-w-[95vw] h-[60rem] md:h-[40rem] rounded-lg flex flex-col items-center p-8" aria-describedby="">
              <DialogHeader className="h-max mr-auto">
                <DialogTitle>Add Table</DialogTitle>
              </DialogHeader>

              <TableCreationForm />

              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <button type="button">Close</button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

export type TableNodeType = Node<
  {
    initialCount?: number;
  },
  "counter"
>;

const TableNode: React.FC<NodeProps> = ({ data, id, parentId, type }) => {
  const currentChildPosition = useSelector(
    childNodePositionSelector(id, parentId),
    isEqual
  );

  const nodeColorSelection: statefulNodeColorType = useMemo(
    () =>
      ({
        primary: "accent",
        secondary: "bg",
        table: "transparent",
        ordinary: "bg",
      } as statefulNodeColorType),
    []
  );
  if (currentChildPosition === -1) return null;

  return (
    <div
      className={`table-node-child all-[inherit] h-[--global-node-height] min-h-[--global-node-height] rounded-md z-9 w-[--node-width-here] bg-${
        nodeColorSelection[
          data.type as unknown as keyof typeof nodeColorSelection
        ]
      } shadow-inner`}
      key={`table-node-${id}`}
      style={
        {
          "--node-width-here": "20rem",
          "--node-pos-here": `${currentChildPosition}`,
        } as unknown as CSSProperties
      }
    >
      <p
        className="w-full text-center h-full flex items-center justify-center text-canvas relative"
        style={{
          color:
            data.type === "primary" ? "rgb(var(--canvas-color))" : "#3c3c3c",
        }}
      >
        {`${(data as any).columnName || ""}`}
        <span
          className="w-4 h-4 absolute flex items-center justify-end right-2"
          style={
            {
              "--icon-color-here":
                data.type === "primary"
                  ? "rgb(var(--canvas-color))"
                  : "#3c3c3c",
            } as unknown as CSSProperties
          }
        >
          <svg className="w-full h-full scale-90 md:scale-75">
            <use
              xlinkHref={
                data.type === "primary"
                  ? "#key"
                  : data.type === "secondary"
                  ? "#link-icon"
                  : ""
              }
            ></use>
          </svg>
        </span>
      </p>

      {(data as any).type !== "primary" &&
      (data as any).type !== "secondary" ? null : (
        <>
          <Handle
            type={data.type === "primary" ? "target" : "source"}
            position={Position.Left}
            id={`${id}-handle-left`}
            style={{
              borderRadius: "unset",
              outline: "2px solid rgb(var(--fg-color))",
              backgroundColor: "#3c3c3c",
            }}
          />

          <Handle
            type="source"
            position={Position.Right}
            id={`${id}-handle-right`}
            style={{
              borderRadius: "unset",
              outline: "2px solid rgb(var(--fg-color))",
              backgroundColor: "#3c3c3c",
            }}
          />
        </>
      )}
    </div>
  );
};

const GroupTableNode: React.FC<NodeProps> = ({ id, data }) => {
  const childrenCount = useSelector(nodeChildrenLengthSelector(id));
  return (
    <div
      className="flex flex-col table-node-group relative overflow-y-visible"
      style={
        {
          "--node-width-here": "20rem",
          "--node-children-here": childrenCount,
        } as unknown as CSSProperties
      }
    >
      <div className="group-head-handle relative  w-[--node-width-here] h-8 min-h-8 mx-auto bg-canvas ring-1 rounded-[3px] ring-outline1/45 flex justify-end px-2 items-center">
        <div className="grid grid-cols-2 h-[70%] w-8 md:w-6 y-centered-absolute left-1 scale-[0.8]">
          <span className="w-1 h-1 rounded-full bg-outline1d"></span>
          <span className="w-1 h-1 rounded-full bg-outline1d ml-[-5px]"></span>
          <span className="w-1 h-1 rounded-full bg-outline1d "></span>
          <span className="w-1 h-1 rounded-full bg-outline1d ml-[-5px]"></span>
          <span className="w-1 h-1 rounded-full bg-outline1d "></span>
          <span className="w-1 h-1 rounded-full bg-outline1d ml-[-5px]"></span>
        </div>
        <button className="w-[10px] h-[10px]">
          <svg className="w-full h-full stroke-outline1d">
            <use xlinkHref="#pencil"></use>
          </svg>
        </button>
      </div>

      <NodeToolbar
        isVisible={data.toolbarVisible as boolean | undefined}
        position={Position.Top}
        className="w-[--node-width-here] text-start text-sm text-outline1d flex justify-start items-center left-0 pb-4 mix-blend-difference node-toolbar absolute"
        offset={20}
      >
        {`${(data as any).label}`}
      </NodeToolbar>
    </div>
  );
};

const tableNodeTypes = {
  tableNode: TableNode,
  group: GroupTableNode,
};

const tableEdgeTypes = {
  bidirectional: BidirectionalEdge,
};

export const DesignCanvas: React.FC<{
  instance:
    | ReactFlowInstance<StatefulNodeType & { id: string }, Edge>
    | undefined;
  setInstance: React.Dispatch<
    React.SetStateAction<
      ReactFlowInstance<StatefulNodeType & { id: string }, Edge> | undefined
    >
  >;
}> = React.memo(
  function CanvasInner({ instance, setInstance }) {
    // GLOBAL STATE
    const dispatch = useDispatch();
    const nodes = useSelector(nodesSelector, isEqual);
    const edges = useSelector(edgesSelector, isEqual);

    // CONTEXT STATE
    const { chatBubbleDispatch } = useContext(
      chatBubbleContext
    ) as ChatBubbleContextValueType;

    // LOCAL STATE
    const [designPaneState, designPaneDispatch] = useReducer(
      designPaneReducer,
      initialDesignPaneState
    );
    const designPaneValue = useMemo(
      () => ({ designPaneState, designPaneDispatch }),
      [designPaneState, designPaneDispatch]
    );

    const [panPosFrame, setPanPosFrame] = useState<[{ x: number; y: number }]>([
      { x: 0, y: 0 },
    ]);

    const [edges_, setEdges, onEdgesChange] = useEdgesState(edges);

    // COMPONENT EVENT HANDLERS
    useEventListener(
      "keyup",
      handleKeyPress(null, (event) => {
        if (!event) return;
        switch (event.key) {
          case "Escape": {
            designPaneDispatch(__setActiveTab(null));
            break;
          }
          default:
            break;
        }
      }),
      window as unknown as HTMLElement
    );

    const getCanvasPosition = useCallback(
      (event: React.MouseEvent<Element, MouseEvent>) => {
        if (!instance) return { x: undefined, y: undefined };
        let { zoom } = instance.getViewport();

        // now, we get the position delta
        const panPosDeltaX = panPosFrame[0].x;
        const panPosDeltaY = panPosFrame[0].y;

        console.log("pan position frame ", panPosFrame);
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
        switch (designPaneState.activeTab) {
          case "comment": {
            if (!instance) break;
            const { x, y } = getCanvasPosition(event);
            if (!(x && y)) break;
            chatBubbleDispatch(__addBubble({ x, y }));
          }
          case "table": {
            designPaneDispatch(__setActiveTab(null));
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

    const onConnect: OnConnect = useCallback(
      (params) =>
        setEdges((eds) => {
          const edge = params;
          const sourceNodeParentID = edge.source.split(":")[0] || "";
          const targetNodeParentID = edge.target.split(":")[0] || "";

          const equivTargetNode =
            store.getState().nodes.groupNodes[targetNodeParentID]?.nodes[
              edge.target
            ];

          const equivSourceNode =
            store.getState().nodes.groupNodes[sourceNodeParentID]?.nodes[
              edge.source
            ];

          if (!(equivTargetNode && equivSourceNode)) return eds;

          if (
            equivTargetNode.data.type !== "primary" ||
            equivSourceNode.data.type !== "secondary" ||
            sourceNodeParentID === targetNodeParentID
          ) {
            return eds;
          }

          return addEdge(params, eds);
        }),
      []
    );

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

    return (
      <>
        <ReactFlow
          nodes={nodes}
          nodeTypes={
            tableNodeTypes as unknown as { [prop: string]: React.FC<NodeProps> }
          }
          onConnect={onConnect}
          edgeTypes={tableEdgeTypes}
          onNodesChange={onNodesChange}
          edges={edges_}
          onPaneClick={onPaneClick}
          defaultViewport={{ zoom: 1, x: 0, y: 0 }}
          maxZoom={!!designPaneState.activeTab ? 1 : 4}
          minZoom={!!designPaneState.activeTab ? 1 : 0.25}
          connectionMode={ConnectionMode.Loose}
          onMoveEnd={(_, vp) => {
            setPanPosFrame((prev) => {
              const [end] = prev;
              if (end.x === vp.x && end.y === vp.y) return prev;
              return [{ x: vp.x, y: vp.y ? -vp.y : vp.y }];
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
  },
  (prev, next) => isEqual(prev, next)
);

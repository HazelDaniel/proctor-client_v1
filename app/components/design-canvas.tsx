/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import {
  Background,
  ConnectionMode,
  Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  NodeToolbar,
  OnConnect,
  OnEdgesChange,
  Panel,
  Position,
  ReactFlow,
  ReactFlowInstance,
  ViewportPortal,
  XYPosition,
  addEdge,
  useEdgesState,
} from "@xyflow/react";
import React, {
  ChangeEvent,
  CSSProperties,
  FocusEventHandler,
  FormEvent,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
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
import { useEventListener } from "~/hooks/useevent";
import {
  __addBubble,
  __removeBubble,
  __updateBubble,
  selectChatBubbles,
  selectLastAddedBubble,
} from "~/reducers/chat-bubble.reducer";
import {
  __setActiveTab,
  designPaneReducer,
  initialDesignPaneState,
} from "~/reducers/design-pane.reducer";
import {
  addNodeGroup,
  setActiveNode,
  setNodePosition,
  updateNodeGroup,
} from "~/reducers/nodes.reducer";
import {
  activeNodeSelector,
  childNodePositionSelector,
  edgesSelector,
  graphSelector,
  groupNodeSelector,
  nodeChildrenLengthSelector,
  nodesSelector,
  savedTableSelector,
  settingsSelector,
  store,
  tableUpdateModalSelector,
  typeMappingSelector,
} from "~/store";
import {
  NodeCompositeID,
  StatefulNodeType,
  TableCRUDFormStateType,
  statefulNodeColorType,
} from "~/types";
import { isEqual } from "~/utils/comparison";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { BidirectionalEdge } from "./bidirectional-edge";
import { TableCreationForm } from "./table-creation-form";
import { parseNodeID } from "~/utils/node.utils";
import { TableUpdateForm } from "./table-update-form";
import { download, upload } from "~/reducers/table-to-node.reducer";
import {
  __passComposites,
  __retractComposites,
  tableUpdateFormReducer,
} from "~/reducers/table-update-form.reducer";
import {
  tableUpdateContext,
  TableUpdateContextValueType,
  TableUpdateProvider,
} from "~/contexts/table-update-form.context";
import { __addNodeTable } from "~/reducers/utils/shared-functions";
import {
  addConnection,
  hasOutboundEdges,
  removeConnection,
} from "~/reducers/graph.reducer";
import {
  addCompositions,
  removeCompositionParent,
} from "~/reducers/composition.reducer";
import { ButtonEdge } from "./button-edge";
import {
  closeUpdateFormModal,
  openUpdateFormModal,
} from "~/reducers/update-form-modal.reducer";
import { EdgeProvider } from "~/contexts/edge.context";
import { Send } from "lucide-react";
import { useYjsSync } from "~/hooks/use-yjs-sync";

export const ChatBubble: React.FC<{ pos: XYPosition; id: string }> = ({
  pos,
  id,
}) => {
  const [initialChatText, setInitialChatText] = useState<string>("");

  const { chatBubbleState, chatBubbleDispatch } = useContext(
    chatBubbleContext
  ) as ChatBubbleContextValueType;

  const lastAddedBubble = useMemo(
    () => selectLastAddedBubble(chatBubbleState),
    [chatBubbleState]
  );

  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleOnBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
    e.preventDefault();
    if (!!!initialChatText.trim()) {
      chatBubbleDispatch(__removeBubble(id));
      return;
    }
    chatBubbleDispatch(__updateBubble(id, { hasComments: true }));
  };

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInitialChatText(e.target.value);
  };

  useEffect(() => {
    if (lastAddedBubble && lastAddedBubble.data.id === id) {
      if (chatInputRef.current && !lastAddedBubble.hasComments) {
        chatInputRef.current.focus();
      }
    }
  }, [chatInputRef, lastAddedBubble, id]);

  return (
    <>
      <div
        className={`floating-portal-item w-8 h-8 bg-accentBright absolute p-1 overflow-visible`}
        style={
          {
            "--pos-x": `${pos.x}px`,
            "--pos-y": `${pos.y}px`,
            "--zoom-factor": `${1}px`,
          } as CSSProperties
        }
      >
        <div className="size-full scale-[0.95] bg-outline1d rounded-full origin-top-right"></div>
      </div>

      <form
        className={`bubble-chat-input flex flex-col w-60 h-[8rem] rounded-lg bg-outline1 border-4 border-outline1 text-sm p-2 text-outline1d outline-none shadow-md ${
          lastAddedBubble?.data.id !== id || lastAddedBubble?.hasComments
            ? "hidden"
            : "flex"
        }`}
        style={
          {
            "--pos-x": `${pos.x}px`,
            "--pos-y": `${pos.y}px`,
            "--zoom-factor": `${1}px`,
          } as CSSProperties
        }
      >
        <textarea
          ref={chatInputRef}
          className="outline-none rounded-sm w-full p-1 no-scrollbar shadow-sm inset-2 text-sm flex-1"
          name="bubble_chat_init_text"
          onChange={handleOnChange}
          onBlur={handleOnBlur}
        ></textarea>
        {/* 
        <button
          type="submit"
          className="z-[9] h-5 bg-outline1d w-8 self-end rounded-sm mt-2"
          onClick={handleOnSubmitClick}
        >
          <Send fill="canvas" />
        </button> */}
      </form>
    </>
  );
};

export const ChatBubbleView: React.FC = React.memo(
  function ChatBubbleViewInner() {
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
          return (
            <ChatBubble pos={bubble.position} key={bubble.id} id={bubble.id} />
          );
        })}
      </ViewportPortal>
    );
  }
);

const DesignPanel: React.FC = React.memo(function DesignPanelInner() {
  const { designPaneDispatch, designPaneState } = useContext(
    designPaneContext
  ) as DesignPaneContextValueType;
  const dispatch = useDispatch();

  const activeNode = useSelector(activeNodeSelector);

  useEffect(() => {
    if (activeNode) {
      designPaneDispatch(__setActiveTab(null));
    }
  }, [activeNode]);

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
            dispatch(setActiveNode({ activeNodeID: null }));
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
            dispatch(setActiveNode({ activeNodeID: null }));
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
            <DialogContent
              className="w-[80vw] min-w-[95vw] h-[clamp(60rem, 95vh, 60rem)] md:h-[clamp(40rem, 95vh, 99vh)] rounded-lg flex flex-col items-center p-8 form-creation-dialog-content"
              aria-describedby=""
            >
              <DialogHeader className="h-max mr-auto">
                <DialogTitle>Add Table</DialogTitle>
              </DialogHeader>

              <TableCreationForm />
            </DialogContent>
          </Dialog>
        </li>

        <li
          className={
            "flex items-center justify-center w-16 h-16 p-2 rounded-md cursor-pointer ring-outline1/35 ring-2 has-[.active]:ring-accent transition-all duration-300"
          }
          onClick={(e) => {
            e.stopPropagation();
            dispatch(setActiveNode({ activeNodeID: null }));
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

const TableNode: React.FC<NodeProps<StatefulNodeType>> = ({
  data,
  id,
  parentId,
  type,
}) => {
  const currentChildPosition = useSelector(
    childNodePositionSelector(id, parentId),
    isEqual
  );

  const nodeColorSelection: statefulNodeColorType = useMemo(
    () =>
      ({
        primary: "accentLight",
        secondary: "bg",
        table: "transparent",
        ordinary: "bg",
        "composite-primary": "accentLight",
        composite: "bg",
      } as statefulNodeColorType),
    []
  );
  if (currentChildPosition === -1) return null;

  return (
    <div
      className={
        `table-node-child all-[inherit] h-[--global-node-height] min-h-[--global-node-height] rounded-md z-9 w-[--node-width-here] bg-${
          nodeColorSelection[
            data.type as unknown as keyof typeof nodeColorSelection
          ] || "accentLight"
        } shadow-inner` +
        `${data.isSurrogate ? " surrogate opacity-55" : ""} ${data.type}`
      }
      key={id}
      style={
        {
          "--node-width-here": "20rem",
          "--node-pos-here": `${currentChildPosition}`,
        } as unknown as CSSProperties
      }
    >
      <p
        className="w-full text-center h-full flex items-center justify-center text-canvas relative truncate"
        style={{
          color:
            data.type === "primary" || data.isSurrogate
              ? "rgb(var(--canvas-color))"
              : "#3c3c3c",
        }}
      >
        {`${data.column?.name || ""}`}
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

      {data.type === "ordinary" || data.type === "table" ? null : (
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
  const dispatch = useDispatch();
  const globalTypeMappings = useSelector(typeMappingSelector, isEqual);
  const {
    tableUpdateDispatch: updateFormDispatch,
    tableUpdateState: updateFormState,
  } = useContext(tableUpdateContext) as TableUpdateContextValueType;
  const groupNode = useSelector(groupNodeSelector(id));

  const savedTable = useSelector(savedTableSelector);

  useLayoutEffect(() => {
    updateFormDispatch(__addNodeTable(id, groupNode, globalTypeMappings));
  }, [id, groupNode]);

  const tableUpdateModal = useSelector(tableUpdateModalSelector);

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
        {
          <Dialog
            open={tableUpdateModal.open}
            onOpenChange={(open) => {
              if (!open) {
                dispatch(closeUpdateFormModal());
              }
            }}
          >
            <DialogTrigger asChild className="">
              <button
                className="w-[10px] h-[10px]"
                onClick={() => {
                  dispatch(setActiveNode({ activeNodeID: id }));
                  dispatch(
                    download({ groupID: id, mappings: globalTypeMappings })
                  );
                  dispatch(openUpdateFormModal());
                }}
              >
                <svg className="w-full h-full stroke-outline1d">
                  <use xlinkHref="#pencil"></use>
                </svg>
              </button>
            </DialogTrigger>
            {tableUpdateModal.open && id === savedTable?.tableID ? (
              <DialogContent
                className="w-[80vw] min-w-[95vw] h-[clamp(60rem, 95vh, 60rem)] md:h-[clamp(40rem, 95vh, 99vh)] rounded-lg flex flex-col items-center p-8 form-creation-dialog-content"
                aria-describedby=""
              >
                <DialogHeader className="h-max mr-auto">
                  <DialogTitle>Edit Table</DialogTitle>
                </DialogHeader>
                <TableUpdateForm id={id} />
              </DialogContent>
            ) : null}
          </Dialog>
        }
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
  button: ButtonEdge,
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
    const graph = useSelector(graphSelector, isEqual);

    const savedTable = useSelector(savedTableSelector);

    const [updateFormState, updateFormDispatch] = useReducer(
      tableUpdateFormReducer,
      {
        [savedTable?.tableID as string]: {
          ...(savedTable as TableCRUDFormStateType),
          errorState: false,
          errorMessage: null,
        },
      }
    );

    const updateFormValue: TableUpdateContextValueType = useMemo(
      () => ({
        tableUpdateState: updateFormState,
        tableUpdateDispatch: updateFormDispatch,
        state: updateFormState,
      }),
      [updateFormState, updateFormDispatch]
    );

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

    const [tableSyncCount, setTableSyncCount] = useState<number>(0);
    const [syncTableID, setsyncTableID] = useState<string | null>(null);

    const [panPosFrame, setPanPosFrame] = useState<[{ x: number; y: number }]>([
      { x: 0, y: 0 },
    ]);

    const [edges_, setEdges, onEdgesChange] = useEdgesState(edges);

    const edgeContextValue = useMemo(
      () => ({ edges: edges_, setEdges }),
      [edges_, setEdges]
    );

    // Initialize Yjs synchronization
    useYjsSync();

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

        // console.log("pan position frame ", panPosFrame);
        // console.log(
        //   `--panPosDeltaX: ${panPosDeltaX}\t panPosDeltaY: ${panPosDeltaY}`
        // );

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
        console.log("the pane picked up the click instead");

        // console.log("event current target is ", event.target);
        event.stopPropagation();
        switch (designPaneState.activeTab) {
          case "comment": {
            if (!instance) break;
            const { x, y } = getCanvasPosition(event);
            if (!(x && y)) break;
            chatBubbleDispatch(__addBubble({ x, y }));
            break;
          }
          case "table": {
            const currentTableID = store.getState().contextNodes.currentGroupID;
            if (!currentTableID) break;

            const position = getCanvasPosition(event) as XYPosition;
            const currentTable =
              store.getState().contextNodes.groupNodes[currentTableID];
            dispatch(
              addNodeGroup({
                group: currentTable,
                groupID: currentTableID,
                position,
              })
            );

            break;
          }
          default: {
            break;
          }
        }
        designPaneDispatch(__setActiveTab(null));
      },
      [chatBubbleDispatch, instance, panPosFrame, designPaneState.activeTab]
    );

    const onNodesChange = (changes: any) => {
      changes.forEach(({ type, id, position }: any) => {
        if (type === "position") {
          if (
            !(
              position &&
              typeof position.x === "number" &&
              typeof position.y === "number" &&
              !isNaN(position.x) &&
              !isNaN(position.y)
            )
          ) {
            console.warn("Invalid position in onNodesChange:", {
              id,
              position,
            });
            return;
          }
          dispatch(setNodePosition({ id, position }));
        }
      });
    };

    const onConnect: OnConnect = useCallback(
      (params) =>
        setEdges((eds) => {
          const edge = params;
          const [targetNodeParentID] = parseNodeID(
            edge.target as NodeCompositeID
          );
          const [sourceNodeParentID] = parseNodeID(
            edge.source as NodeCompositeID
          );

          const equivTargetNode =
            store.getState().nodes.groupNodes[targetNodeParentID]?.nodes[
              edge.target
            ];

          const equivSourceNode =
            store.getState().nodes.groupNodes[sourceNodeParentID]?.nodes[
              edge.source
            ];

          if (!(equivTargetNode && equivSourceNode)) return eds;
          if (sourceNodeParentID === targetNodeParentID) return eds; // NOTE: FOR SELF-REFERENTIAL TABLES, REMOVE THIS CONSTRAINT IF YOU ARE READY TO HANDLE IT

          if (
            equivTargetNode.data.type === "primary" ||
            equivSourceNode.data.type === "secondary" ||
            equivSourceNode.data.type === "composite"
          ) {
            if (
              !(
                equivSourceNode.data?.column?.id ||
                equivTargetNode.data?.column?.id
              )
            ) {
              console.error(
                `one of source: ${equivSourceNode.data?.column?.id} and target: ${equivTargetNode.data.column?.id} ID doesn't exist`
              );
              return eds;
            }

            if (
              hasOutboundEdges(graph, equivSourceNode.data.column!.id, "node")
            ) {
              return eds;
            }

            if (
              equivTargetNode.data.type === "primary" &&
              equivSourceNode.data.type === "secondary"
            ) {
              dispatch(
                addConnection({
                  source: equivSourceNode.data.column!.id,
                  dest: equivTargetNode.data.column!.id,
                  entryType: "both",
                })
              );
              return addEdge({ ...params, type: "button" }, eds);
            }
            if (
              equivTargetNode.data.type === "composite-primary" &&
              equivSourceNode.data.type === "secondary"
            ) {
              dispatch(
                addConnection({
                  source: equivSourceNode.data.column!.id,
                  dest: equivTargetNode.data.column!.id,
                  entryType: "both",
                })
              );
              updateFormDispatch(
                __passComposites(
                  equivTargetNode.data.column!.id,
                  equivSourceNode.data.column!.id
                )
              );
              // TODO: we still need to add compositions after passing composites

              const [sourceParentID] = parseNodeID(
                equivSourceNode.data.column!.id
              );

              const [targetParentID] = parseNodeID(
                equivTargetNode.data.column!.id
              );

              dispatch(
                addCompositions([
                  equivSourceNode.data.column!.id,
                  (
                    updateFormState[targetParentID].columns[
                      equivTargetNode.data.column!.id
                    ].compositeOn || []
                  ).map((el) => {
                    const [parent, entry] = parseNodeID(el as NodeCompositeID);
                    return `${parent}:${entry}`;
                  }),
                ])
              );

              setsyncTableID(sourceParentID);
              setTableSyncCount((prev) => prev + 1);

              return addEdge({ ...params, type: "button" }, eds);
            }
          }

          return eds;
        }),
      [graph, updateFormState]
    );

    const onLinksChange: OnEdgesChange = useCallback(
      (changes) => {
        changes.forEach((change) => {
          if (change.type === "remove") {
            const edge = edges_.find((e) => e.id === change.id);
            if (!edge) return;

            dispatch(
              removeConnection({
                source: edge.source,
                dest: edge.target,
                entryType: "both",
              })
            );

            updateFormDispatch(
              __retractComposites(edge.source as NodeCompositeID)
            );

            const [sourceParentID] = parseNodeID(
              edge.source as NodeCompositeID
            );

            dispatch(removeCompositionParent(edge.source as NodeCompositeID));

            setsyncTableID(sourceParentID);
            setTableSyncCount((prev) => prev + 1);
          }
        });
      },
      [edges_]
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

    useEffect(() => {
      if (!syncTableID) return;

      const sourceTable = updateFormState[syncTableID];

      if (!sourceTable) {
        console.error("could not upload table to nodes, table doesn't exist");
      }

      // yjs_sync_point:3
      // dispatch(upload(sourceTable));// [FEATURE_TOGGLE_TEST] honestly, i don't know if this makes a difference
      dispatch(updateNodeGroup({ group: sourceTable }));
    }, [tableSyncCount]);

    console.log("update table state is ", updateFormState);
    console.log("nodes are", nodes);
    console.log("edges are", edges_);

    return (
      <>
        <TableUpdateProvider value={updateFormValue}>
          <EdgeProvider value={edgeContextValue}>
            <ReactFlow
              nodes={nodes}
              nodeTypes={
                tableNodeTypes as unknown as {
                  [prop: string]: React.FC<NodeProps>;
                }
              }
              // yjs_sync_point:5
              onConnect={onConnect}
              edgeTypes={tableEdgeTypes}
              onNodesChange={onNodesChange}
              // yjs_sync_point:4
              onEdgesChange={onLinksChange}
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
          </EdgeProvider>
        </TableUpdateProvider>
      </>
    );
  },
  (prev, next) => isEqual(prev, next)
);

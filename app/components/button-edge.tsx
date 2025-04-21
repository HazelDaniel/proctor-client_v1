/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useStore,
  useReactFlow,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useContext, useMemo } from "react";
import { edgeContext } from "~/contexts/edge.context";

export function ChildfulEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  children,
}: EdgeProps & {
  children: React.ReactNode;
}) {
  const [edgePath, labelX, labelY, offsetX, offsetY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    // children
  });
  const nodesInitialized = useStore((state) => state.nodes.length > 0);
  const edgeCtx = useContext(edgeContext);
  if (!edgeCtx) throw new Error("edge context not reachable!");

  const { edges } = edgeCtx;
  const Y_SCALE_FACTOR = useMemo(
    () => (window.innerWidth < 800 ? 0.468339678 : 4.891339678),
    []
  );

  const Y_SHIFT_FACTOR = useMemo(
    () => 1.95 * (Y_SCALE_FACTOR * 1.4),
    // () => -10,
    [edges.length, Y_SCALE_FACTOR]
  );

  if (!nodesInitialized) return null;

  // const X_SCALE_FACTOR = window.innerWidth < 800 ? 0.468339678 : 0.491339678;
  // const X_SHIFT_FACTOR = window.innerWidth * X_SCALE_FACTOR;

  const btnPxSize = 1;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="button-edge__label nodrag nopan z-[9] pointer-events-auto"
          style={{
            // transform: `translate(-50%, -50%) translate(${labelX - (btnPxSize)}px,${labelY - ((btnPxSize * (Y_PAD_FACTOR + 1)) + Y_SHIFT_FACTOR)}px)`,
            // transform: `translate(-50%, -50%) translate(${labelX - (btnPxSize)}px,${labelY - ((btnPxSize + Y_SHIFT_FACTOR))}px)`,
            transform: `translate(-50%, -50%) translate(${labelX - 16}px,${
              labelY - (btnPxSize + Y_SHIFT_FACTOR)
            }px)`,
            height: `${btnPxSize}px`,
            width: `${btnPxSize}px`,
          }}
        >
          {children}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const ButtonEdge: React.FC<EdgeProps> = (props: EdgeProps) => {
  const edgeCtx = useContext(edgeContext);
  const { id } = props;
  if (!edgeCtx) throw new Error("edge context not reachable!");
  const { setEdges } = edgeCtx;
  const { setEdges: setEdges2 } = useReactFlow();

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
    setEdges2((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <ChildfulEdge {...props}>
      <button
        className="button-edge__button z-[9] bg-outline1 p-1 rounded-full"
        onClick={onEdgeClick}
      >
        <X className="rounded-full  stroke-canvas" />
      </button>
    </ChildfulEdge>
  );
};

export default ButtonEdge;

/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  EdgeProps,
  BaseEdge,
  useReactFlow,
  EdgeLabelRenderer,
  getBezierPath,
  useStore,
} from "@xyflow/react";
import { X } from "lucide-react";

export function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const nodesInitialized = useStore((state) => state.nodes.length > 0);
  if (!nodesInitialized) return null;

  const onEdgeClick = () => {
    console.log("clicked on an edge!");
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const X_SCALE_FACTOR = window.innerWidth < 800 ? 0.468339678 : 0.491339678;
  const X_SHIFT_FACTOR = window.innerWidth * X_SCALE_FACTOR;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="button-edge__label nodrag nopan z-8"
          style={{
            transform: `translate(-50%, -50%) translate(${Math.max(
              labelX + X_SHIFT_FACTOR,
              0
            )}px,${labelY}px)`,
          }}
        >
          <div className="button-edge__button z-8">
            <X className="rounded-full border-accent border-2 stroke-outline1"  onClick={onEdgeClick}/>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default ButtonEdge;

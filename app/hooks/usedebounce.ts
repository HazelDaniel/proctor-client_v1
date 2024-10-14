import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import {
  Edge,
  ReactFlowProps,
  OnNodesChange,
  NodeChange,
  NodePositionChange,
  XYPosition,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { StatefulNodeType } from "~/types";

export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  let handler: ReturnType<typeof setTimeout> | undefined = undefined;

  useEffect(() => {
    if (handler) {
      clearTimeout(handler);
    }
    handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebounceNodePosChange(
  duration: number,
  dispatcher: Dispatch<UnknownAction>,
  action: (id: XYPosition | undefined) => UnknownAction,
  position: XYPosition | undefined
) {
  const [currPos, setCurrPos] = useState<XYPosition | undefined>();
  const debouncedValue = useDebounce<XYPosition | undefined>(
    currPos,
    duration
  );

  useEffect(() => {
    if (debouncedValue) {
    console.log("current position: ", debouncedValue);
      dispatcher(action(currPos));
    }
  }, [debouncedValue]);

  const onNodesChange: OnNodesChange<StatefulNodeType & { id: string }> =
    useMemo(
      () => (changes) => {
        changes.forEach((currChange) => {
          let change: NodePositionChange = currChange as NodePositionChange;
          if (change.type === "position") {
            setCurrPos(change.position);
          }
        });
      },
      [debouncedValue]
    );

  return { onNodesChange };
}

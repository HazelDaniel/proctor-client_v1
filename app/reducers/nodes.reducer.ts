import { createSlice } from "@reduxjs/toolkit";
import type { Action, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import type { StatefulNodeType } from "~/types";

export interface NodesStateType {
  groupNodes: {
    [prop: string]: Omit<StatefulNodeType, "id"> & {
      nodes: { [prop: string]: Omit<StatefulNodeType, "id"> };
    };
  };
}

const initialNodesState: NodesStateType = {
  groupNodes: {
    "gnode-a": {
      data: { label: "" },
      position: { x: 0, y: 0 },
      type: "group",
      className: "table-node-group",
      style: {
        width: "max-content",
        height: "max-content",
        padding: "0"
      },
      nodes: {
        "node-2": {
          data: { label: "World!" },
          position: { x: 0, y: 3 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: true,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
          },
        },
        "node-3": {
          data: { label: "World!" },
          position: { x: 0, y: 7 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: true,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
          },
        },
      },
    },
  },
};

const nodesSlice = createSlice({
  name: "nodes:nodes",
  initialState: initialNodesState,
  reducers: {
    setNodePosition: (state, action) => {
      const { id, position } = action.payload;
      const node = state.groupNodes[id];
      if (node) {
        node.position = position;
      }
    },
  },
});

export const { setNodePosition } = nodesSlice.actions;

const nodesReducer = nodesSlice.reducer;

export default nodesReducer;

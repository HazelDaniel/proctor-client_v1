import { createSlice } from "@reduxjs/toolkit";
import type { Action, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import type { StatefulNodeType } from "~/types";

export interface NodesStateType {
  groupNodes: {
    [prop: string]: Omit<StatefulNodeType, "id" | "data"> & {
      nodes: { [prop: string]: Omit<StatefulNodeType, "id"> };
      data: {[prop: string]: any}
    };
  };
}

const initialNodesState: NodesStateType = {
  groupNodes: {
    "gnode-a": {
      data: { label: "", toolbarVisible: true, toolbarPosition: "top" },
      position: { x: 0, y: 0 },
      type: "group",
      className: "table-node-group",
      style: {
        width: "max-content",
        height: "max-content",
        padding: "0",
        backgroundColor: "unset",
      },
      nodes: {
        "1729152101929": {
          data: { label: "World!", type: "primary" },
          position: { x: 0, y: 0 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
          },
        },
        "1729152101939": {
          data: { label: "World!", type: "ordinary" },
          position: { x: 0, y: 43 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
          },
        },
      },
    },
    "gnode-b": {
      data: { label: "", toolbarVisible: true, type: "" },
      position: { x: 520, y: 200 },
      type: "group",
      className: "table-node-group",
      style: {
        width: "max-content",
        height: "max-content",
        padding: "0",
        backgroundColor: "unset",
      },
      nodes: {
        "1729152101949": {
          data: { label: "World!", type: "primary" },
          position: { x: 0, y: 0 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
          },
        },
        "1729152101959": {
          data: { label: "World!", type: "ordinary" },
          position: { x: 0, y: 43 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
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

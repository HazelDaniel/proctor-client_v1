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
          data: { label: "World!" },
          position: { x: 0, y: 0 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
            marginTop:
              "calc(var(--node-pos-here) * var(--global-node-height) + 8px * var(--node-pos-here))",
            ...{ "--node-pos-here": "0" },
          },
        },
        "1729152101939": {
          data: { label: "World!" },
          position: { x: 0, y: 0 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
            marginTop: `calc(var(--node-pos-here) * var(--global-node-height) + 8px * var(--node-pos-here))`,
            ...{ "--node-pos-here": "1" },
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
          data: { label: "World!" },
          position: { x: 0, y: 0 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
            marginTop: `calc(var(--node-pos-here) * var(--global-node-height) + 8px * var(--node-pos-here))`,
            ...{ "--node-pos-here": "0" },
          },
        },
        "1729152101959": {
          data: { label: "World!" },
          position: { x: 0, y: 0 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
            marginTop: `calc(var(--node-pos-here) * var(--global-node-height) + 8px * var(--node-pos-here))`,
            ...{ "--node-pos-here": "1" },
          },
        },
      },
    },
  },
  // groupNodes: {

  // },
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

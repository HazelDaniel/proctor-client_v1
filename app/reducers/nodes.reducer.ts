import { createSlice } from "@reduxjs/toolkit";
import type { Action, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { Edge, MarkerType } from "@xyflow/react";
import type { StatefulGroupNodeType, StatefulNodeType } from "~/types";

export interface NodesStateType {
  groupNodes: StatefulGroupNodeType;
  edges: { [prop: string]: Omit<Edge, "id"> };
}

const initialNodesState: NodesStateType = {
  groupNodes: {
    "gnode-a": {
      data: {
        label: "customers",
        toolbarVisible: true,
        toolbarPosition: "top",
      },
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
        "gnode-a:1729152101929": {
          data: { label: "World!", type: "primary", columnName: "customer_id" },
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
        "gnode-a:1729152101939": {
          data: { label: "", type: "ordinary", columnName: "full_name" },
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
        "gnode-a:1729152101949": {
          data: { label: "", type: "secondary", columnName: "order_id" },
          position: { x: 0, y: 86 },
          type: "tableNode",
          extent: "parent",
          className: "table-node",
          draggable: false,
          style: {
            width: "var(--node-width-here)",
            height: "var(--global-node-height)",
          },
        },
        "gnode-a:1729152100049": {
          data: { label: "", type: "ordinary", columnName: "order_date" },
          position: { x: 0, y: 129 },
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
      data: { label: "orders", toolbarVisible: true, type: "table" },
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
        "gnode-b:1729152101949": {
          data: { label: "World!", type: "primary", columnName: "order_id" },
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
        "gnode-b:1729152101959": {
          data: { label: "World!", type: "ordinary", columnName: "ordered_at" },
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
  edges: {},
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

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Edge, XYPosition } from "@xyflow/react";
import type { StatefulGroupNodeType } from "~/types";

const NODE_OFFSET_VALUE = 43;

export interface NodesStateType {
  groupNodes: StatefulGroupNodeType;
  edges: { [prop: string]: Omit<Edge, "id"> };
  activeNode: string | null;
}

const initialNodesState: NodesStateType = {
  groupNodes: {},
  edges: {},
  activeNode: null,
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
    setActiveNode: (state, action) => {
      const { activeNodeID } = action.payload;
      state.activeNode = activeNodeID;
    },
    addNodeGroup: (
      state,
      action: PayloadAction<{
        groupID: string;
        group: StatefulGroupNodeType[string];
        position?: XYPosition;
      }>
    ) => {
      let { position, group, groupID } = action.payload;
      let resultNodes: StatefulGroupNodeType[string]["nodes"];
      if (position) {
        resultNodes = Object.fromEntries(
          Object.entries(group.nodes).map(([key, value], index) => {
            return [
              key,
              {
                ...value,
                position: { x: 0, y: index * NODE_OFFSET_VALUE },
                style: {
                  width: "var(--node-width-here)",
                  height: "var(--global-node-height)",
                },
                type: "tableNode",
                extent: "parent" as const,
                className: "table-node",
                draggable: false,
              },
            ];
          })
        );
        group = {
          ...group,
          position,
        };
      } 

      resultNodes = Object.fromEntries(
        Object.entries(group.nodes).map(([key, value], index) => {
          return [
            key,
            {
              ...value,
              position: { x: 0, y: index * NODE_OFFSET_VALUE },
              style: {
                width: "var(--node-width-here)",
                height: "var(--global-node-height)",
              },
              type: "tableNode",
              extent: "parent" as const,
              className: "table-node",
              draggable: false,
            },
          ];
        })
      );
      group = {
        ...group,
        nodes: resultNodes,
        className: "table-node-group",
        style: {
          width: "max-content",
          height: "max-content",
          padding: "0",
          backgroundColor: "unset",
        },
      };
      state.groupNodes[groupID] = group;
    },
  },
});

export const { setNodePosition, setActiveNode, addNodeGroup } = nodesSlice.actions;

const nodesReducer = nodesSlice.reducer;

export default nodesReducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NodeCompositeID, TableGraphStateType } from "~/types";
import {
  createGraph,
  addEdge as addGraphEdge,
  removeEdge as removeGraphEdge,
  hasIncomingNeighbors,
  hasOutgoingNeighbors,
} from "~/utils/graph.utils";
import { parseNodeID } from "~/utils/node.utils";

export type GraphEntryType = "table" | "node" | "both";

export const initialTableGraphState: TableGraphStateType = {
  tables: createGraph(),
  nodes: createGraph(),
};

export const tableGraphSlice = createSlice({
  name: "tables:graph",
  initialState: initialTableGraphState,
  reducers: {
    addConnection: (
      state,
      action: PayloadAction<{
        entryType: GraphEntryType;
        source: string;
        dest: string;
      }>
    ) => {
      const { entryType, source, dest } = action.payload;
      const [sourceParent] = parseNodeID(source as NodeCompositeID);
      const [destParent] = parseNodeID(dest as NodeCompositeID);

      if (entryType === "table") {
        addGraphEdge(state.tables, sourceParent, destParent);
      } else if (entryType === "node") {
        addGraphEdge(state.nodes, source, dest);
      } else {
        addGraphEdge(state.tables, sourceParent, destParent);
        addGraphEdge(state.nodes, source, dest);
      }
    },
    removeConnection: (
      state,
      action: PayloadAction<{
        entryType: GraphEntryType;
        source: string;
        dest: string;
      }>
    ) => {
      const { entryType, source, dest } = action.payload;
      const [sourceParent] = parseNodeID(source as NodeCompositeID);
      const [destParent] = parseNodeID(dest as NodeCompositeID);

      if (entryType === "table") {
        removeGraphEdge(state.tables, sourceParent, destParent);
      } else if (entryType === "node") {
        removeGraphEdge(state.nodes, source, dest);
      } else {
        removeGraphEdge(state.tables, sourceParent, destParent);
        removeGraphEdge(state.nodes, source, dest);
      }
    },
  },
});

export const graphReducer = tableGraphSlice.reducer;

export const { addConnection, removeConnection } = tableGraphSlice.actions;

// UTILS
export const hasOutboundEdges = (
  state: TableGraphStateType,
  node: string,
  entryType: GraphEntryType
) => {
  const [parent] = parseNodeID(node as NodeCompositeID);

  if (entryType === "table") {
    return hasOutgoingNeighbors(state.tables, parent);
  } else if (entryType === "node") {
    return hasOutgoingNeighbors(state.nodes, node);
  } else {
    throw new Error("cannot check outbound edge for both table and node");
  }
};

export const hasInboundEdges = (
  state: TableGraphStateType,
  node: string,
  entryType: GraphEntryType
) => {
  const [parent] = parseNodeID(node as NodeCompositeID);

  if (entryType === "table") {
    return hasIncomingNeighbors(state.tables, parent);
  } else if (entryType === "node") {
    return hasIncomingNeighbors(state.nodes, node);
  } else {
    throw new Error("cannot check inbound edge for both table and node");
  }
};

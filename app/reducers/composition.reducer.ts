import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { NodeCompositeID } from "~/types";
import { parseNodeID } from "~/utils/node.utils";

interface CompositionStateType {
  [key: string]: { [key: NodeCompositeID]: { [key: NodeCompositeID]: number } };
}

const initialCompositionState: CompositionStateType = {};

export const compositionSlice = createSlice({
  name: "tables:composition",
  initialState: initialCompositionState,
  reducers: {
    addComposition: (
      state,
      action: PayloadAction<[NodeCompositeID, string]>
    ) => {
      const [nodeID, compositeColumnID] = action.payload;
      const [parentID, _2] = parseNodeID(nodeID);
      if (!state[parentID])
        state[parentID] = { [nodeID]: { [compositeColumnID]: 1 } };
      else
        state[parentID] = {
          ...state[parentID],
          [nodeID]: { ...state[parentID][nodeID], [compositeColumnID]: 1 },
        };
    },
    addCompositions: (
      state,
      action: PayloadAction<[NodeCompositeID, string[]]>
    ) => {
      const [nodeID, compositeColumnIDs] = action.payload;
      const [parentID, _2] = parseNodeID(nodeID);
      for (const compositeColumnID of compositeColumnIDs) {
        if (!state[parentID])
          state[parentID] = { [nodeID]: { [compositeColumnID]: 1 } };
        else
          state[parentID] = {
            ...state[parentID],
            [nodeID]: { ...state[parentID][nodeID], [compositeColumnID]: 1 },
          };
      }
    },
    removeCompositionParent: (
      state,
      action: PayloadAction<NodeCompositeID>
    ) => {
      const nodeID = action.payload;
      const [parentID, _2] = parseNodeID(nodeID);
      if (state[parentID] && nodeID in state[parentID])
        delete state[parentID][nodeID];
    },
    removeComposition: (
      state,
      action: PayloadAction<[NodeCompositeID, NodeCompositeID]>
    ) => {
      const [nodeID, compositeColumnID] = action.payload;
      const [parentID, _2] = parseNodeID(action.payload[0]);
      if (
        state[parentID] &&
        nodeID in state[parentID] &&
        compositeColumnID in state[parentID][nodeID]
      )
        delete state[parentID][nodeID][compositeColumnID];
    },
  },
});

export const {
  addComposition,
  removeComposition,
  addCompositions,
  removeCompositionParent,
} = compositionSlice.actions;

export const compositionReducer = compositionSlice.reducer;
export default compositionReducer;


export const getCompositeRep: (state: CompositionStateType, candidate: string) => string = (state, candidate) => {
  void candidate;

  for (const [k, v] of Object.entries(state)) {
    if (candidate in v) {
      return k;
    }
  }

  return "";
};
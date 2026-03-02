import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { NodeCompositeID, CompositionStateType } from "~/types";
import { parseNodeID } from "~/utils/node.utils";

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
    setCompositionState: (state, action: PayloadAction<CompositionStateType>) => {
      return action.payload;
    },
    resetCompositionState: () => initialCompositionState,
  },
});

export const {
  addComposition,
  removeComposition,
  addCompositions,
  removeCompositionParent,
  setCompositionState,
  resetCompositionState,
} = compositionSlice.actions;

export const compositionReducer = compositionSlice.reducer;
export default compositionReducer;

export const getCompositeRep: (
  state: CompositionStateType,
  tableID: string,
  candidate: string
) => string | null = (state, tableID, candidate) => {
  void candidate;

  if (!state[tableID]) return null;

  for (const [k, v] of Object.entries(state[tableID])) {
    if (candidate in v) {
      return k;
    }
  }

  return null;
};

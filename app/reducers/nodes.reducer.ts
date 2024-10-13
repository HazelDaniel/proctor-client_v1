import { createSlice } from "@reduxjs/toolkit";
import type { Action, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import type { StatefulNodeType } from "~/types";

export interface NodesStateType {
  nodes: {[prop: string]: StatefulNodeType};
  portals: {
  }[]
}

const initialNodesState: NodesStateType = {
  nodes:  {
    "1": {data: {label: "Hello"}, position: {x: 0, y: 0}, type: "input"},
    "2": {data: {label: "World!"}, position: {x: 100, y: 100}}
  },
  portals: []
};

const nodesSlice = createSlice({
  name: "nodes:nodes",
  initialState: initialNodesState,
  reducers: {
    setNodePosition: (state, action) => {
      const { id, position } = action.payload;
      const node = state.nodes[id];
      if (node) {
        node.position = position;
      }
    },
  },
});

export const {
  setNodePosition
} = nodesSlice.actions;

const nodesReducer = nodesSlice.reducer;

export const XOpenNode: (
  commentID: number | null
) => ThunkAction<
  void,
  { nodes: ReturnType<typeof nodesReducer> },
  unknown,
  PayloadAction<any> | Action
> = (commentID) => {
  return (dispatch, getState) => {
    // if (!getState().nodes.settings.outputPane) dispatch(closeOutputPane());
    // if (!getState().nodes.settings.sidePane) dispatch(closeSidePane());
    // dispatch(openComments(commentID));
  };
};

export const XOpenViewPortal: () => ThunkAction<
  void,
  { nodes: ReturnType<typeof nodesReducer> },
  unknown,
  PayloadAction<any> | Action
> = () => {
  return (dispatch, getState) => {
  };
};

export default nodesReducer;

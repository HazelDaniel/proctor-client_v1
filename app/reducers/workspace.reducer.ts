import { TaskAbortError, createSlice } from "@reduxjs/toolkit";
import type {
  Action,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";

export interface WorkspaceStateType {
  panes: {
    commentsPane: boolean;
    outputPane: boolean;
    allPanes: boolean;
    sidePane: boolean;
  };
  commentBoard: {
    currentID: number | null;
  };
}

const initialWorkspaceState: WorkspaceStateType = {
  panes: {
    commentsPane: false,
    outputPane: false,
    allPanes: false,
    sidePane: false,
  },
  commentBoard: {
    currentID: null,
  },
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: initialWorkspaceState,
  reducers: {
    openSidePane: (state) => {
      state.panes.sidePane = true;
    },
    closeSidePane: (state) => {
      state.panes.sidePane = false;
    },
    openComments: (state, action: PayloadAction<number | null>) => {
      state.commentBoard.currentID = action.payload;
    },
    closeComments: (state) => {
      state.commentBoard.currentID = null;
    },
    openCommentsPane: (state) => {
      state.panes.commentsPane = true;
    },
    closeCommentsPane: (state) => {
      state.panes.commentsPane = false;
    },
    openOutputPane: (state) => {
      state.panes.outputPane = true;
    },
    closeOutputPane: (state) => {
      state.panes.outputPane = false;
    },
    openAllPanes: (state) => {
      state.panes.outputPane = true;
      state.panes.commentsPane = true;
    },
    closeAllPanes: (state) => {
      state.panes.outputPane = false;
      state.panes.commentsPane = false;
    },
  },
});

export const {
  openAllPanes,
  closeAllPanes,
  openComments,
  closeComments,
  openCommentsPane,
  closeCommentsPane,
  openOutputPane,
  closeOutputPane,
  openSidePane,
  closeSidePane
} = workspaceSlice.actions;

export const XOpenComments: (
  commentID: number | null
) => ThunkAction<
  void,
  WorkspaceStateType,
  unknown,
  PayloadAction<any> | Action
> = (commentID) => {
  return (dispatch, getState) => {
    void getState;
    dispatch(closeOutputPane());
    dispatch(closeSidePane());
    dispatch(openComments(commentID));
  };
};

export const XOpenOutputPane: (
) => ThunkAction<
  void,
  WorkspaceStateType,
  unknown,
  PayloadAction<any> | Action
> = () => {
  return (dispatch, getState) => {
    void getState;
    dispatch(closeSidePane());
    dispatch(closeComments());
    dispatch(openOutputPane());
  };
};

export default workspaceSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";
import type { Action, PayloadAction, ThunkAction } from "@reduxjs/toolkit";

export interface WorkspaceStateType {
  panes: {
    commentsPane: boolean;
    outputPane: boolean;
    allPanes: boolean;
    sidePane: boolean;
    designPane: boolean;
  };
  commentBoard: {
    currentID: string | null;
  };
  settings: {
    commentsPane: boolean;
    outputPane: boolean;
    allPanes: boolean;
    sidePane: boolean;
    designPane: boolean;
  };
}

const initialWorkspaceState: WorkspaceStateType = {
  panes: {
    commentsPane: false,
    outputPane: false,
    allPanes: false,
    sidePane: false,
    designPane: false,
  },
  commentBoard: {
    currentID: null,
  },
  settings: {
    commentsPane: false,
    outputPane: false,
    allPanes: false,
    sidePane: false,
    designPane: false,
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
    openComments: (state, action: PayloadAction<string | null>) => {
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
    openDesignPane: (state) => {
      state.panes.designPane = true;
    },
    closeDesignPane: (state) => {
      state.panes.designPane = false;
    },
    openAllPanes: (state) => {
      state.panes.outputPane = true;
      state.panes.commentsPane = true;
    },
    closeAllPanes: (state) => {
      state.panes.outputPane = false;
      state.panes.commentsPane = false;
    },

    setOpenCommentsPane: (state) => {
      state.panes.commentsPane = true;
      state.settings.commentsPane = true;
    },
    setCloseCommentsPane: (state) => {
      state.panes.commentsPane = false;
      state.settings.commentsPane = false;
    },
    setOpenOutputPane: (state) => {
      state.panes.outputPane = true;
      state.settings.outputPane = true;
    },
    setCloseOutputPane: (state) => {
      state.panes.outputPane = false;
      state.settings.outputPane = false;
    },
    setOpenDesignPane: (state) => {
      state.panes.designPane = true;
      state.settings.designPane = true;
    },
    setCloseDesignPane: (state) => {
      state.panes.designPane = false;
      state.settings.designPane = false;
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
  closeSidePane,
  openDesignPane,
  closeDesignPane,
  setOpenCommentsPane,
  setCloseCommentsPane,
  setOpenOutputPane,
  setCloseOutputPane,
  setOpenDesignPane,
  setCloseDesignPane
} = workspaceSlice.actions;

const workspaceReducer = workspaceSlice.reducer;

export const XOpenComments: (
  commentID: string | null
) => ThunkAction<
  void,
  { workspace: ReturnType<typeof workspaceReducer> },
  unknown,
  PayloadAction<any> | Action
> = (commentID) => {
  return (dispatch, getState) => {
    if (!getState().workspace.settings.outputPane) dispatch(closeOutputPane());
    if (!getState().workspace.settings.sidePane) dispatch(closeSidePane());
    dispatch(openComments(commentID));
  };
};

export const XOpenOutputPane: () => ThunkAction<
  void,
  { workspace: ReturnType<typeof workspaceReducer> },
  unknown,
  PayloadAction<any> | Action
> = () => {
  return (dispatch, getState) => {
    if (!getState().workspace.settings.sidePane) dispatch(closeSidePane());
    if (!getState().workspace.settings.commentsPane)
      dispatch(closeCommentsPane());
    dispatch(openOutputPane());
  };
};

export default workspaceReducer;

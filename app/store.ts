import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { default as workspaceReducer } from "~/reducers/workspace.reducer";

export const store = configureStore({
  reducer: combineReducers({ workspace: workspaceReducer }),
});

export const outputPaneSelector = (state: {workspace: ReturnType<typeof workspaceReducer>}) => {
  return state.workspace.panes.outputPane;
};

export const sidePaneSelector = (state: {workspace: ReturnType<typeof workspaceReducer>}) => {
  return state.workspace.panes.sidePane;
};

export const commentsPaneSelector = (state: {workspace: ReturnType<typeof workspaceReducer>}) => {
  return state.workspace.panes.commentsPane;
}


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

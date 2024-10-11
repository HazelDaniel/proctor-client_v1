import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  PersistConfig,
  FLUSH,
  PAUSE,
  PURGE,
} from "redux-persist";
import { default as workspaceReducer } from "~/reducers/workspace.reducer";
import { PersistoreStore } from "./dao/persistor-store.dao";

const rootReducer = combineReducers({ workspace: workspaceReducer });

const persistConfig: PersistConfig<{
  workspace: ReturnType<typeof workspaceReducer>;
}> = {
  key: "root",
  whitelist: ["workspace"],
  storage: new PersistoreStore(),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      serializableCheck: {
        ignoredActions: [FLUSH, PAUSE, PURGE],
      },
    }),
});

export const persistor = persistStore(store);

export const outputPaneSelector = (state: {
  workspace: ReturnType<typeof workspaceReducer>;
}) => {
  return state.workspace.panes.outputPane;
};

export const sidePaneSelector = (state: {
  workspace: ReturnType<typeof workspaceReducer>;
}) => {
  return state.workspace.panes.sidePane;
};

export const commentsPaneSelector = (state: {
  workspace: ReturnType<typeof workspaceReducer>;
}) => {
  return state.workspace.panes.commentsPane;
};

export const designPaneSelector = (state: {
  workspace: ReturnType<typeof workspaceReducer>;
}) => {
  return state.workspace.panes.designPane;
};

export const commentsSelector = (state: {
  workspace: ReturnType<typeof workspaceReducer>;
}) => {
  return state.workspace.commentBoard.currentID;
};

export const settingsSelector = (state: {workspace: ReturnType<typeof workspaceReducer>}) => {
  return state.workspace.settings;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

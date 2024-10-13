import { createSelector, createStructuredSelector } from "reselect";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  PersistConfig,
  FLUSH,
  PAUSE,
  PURGE,
  REGISTER,
  PERSIST,
  REHYDRATE,
} from "redux-persist";
import { default as workspaceReducer } from "~/reducers/workspace.reducer";
import { default as nodesReducer } from "~/reducers/nodes.reducer";
import { PersistoreStore } from "./dao/persistor-store.dao";

const rootReducer = combineReducers({ workspace: workspaceReducer, nodes: nodesReducer });

const persistConfig: PersistConfig<{
  workspace: ReturnType<typeof workspaceReducer>;
  nodes: ReturnType<typeof nodesReducer>;
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
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// WORKSPACE SELECTORS
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

export const workspaceSelectors = createStructuredSelector({
  outputPane: outputPaneSelector,
  sidePane: sidePaneSelector,
  commentsPane: commentsPaneSelector,
  settings: settingsSelector,
});

// NODES SELECTORS
export const nodesSelector = (state: {
  nodes: ReturnType<typeof nodesReducer>;
}) => {
  const result = [...Object.entries(state.nodes.nodes)].map(([key, value]) => ({
    ...value,
    id: key
  }));

  return result;
};

export const nodeSelector = (id: string) => (state: {nodes: ReturnType<typeof nodesReducer>;}) => {
  return state.nodes.nodes[id];
}

export const subsetNodesSelector = (ids: string[]) => (state: {nodes: ReturnType<typeof nodesReducer>;}) => {
  const result = [];
  for (const id of ids) {
    if (state.nodes.nodes[id]) {
      result.push(state.nodes.nodes[id]);
    }
  }

  return result;
}

export const nodesSelectorMemo = createSelector(
  nodesSelector,
  (nodes) => {
    return nodes;
  }
);

export const nodeSelectorMemo = (id: string) =>
  createSelector(
    nodeSelector(id),
    (node) => {
      return node;
    }
);

export const subsetNodesSelectorMemo =
  (ids: string[]) => createSelector(subsetNodesSelector(ids), (state) => {
    return state;
  })

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

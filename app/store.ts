import { createStructuredSelector } from "reselect";
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
import { StatefulNodeType } from "./types";
import { Edge } from "@xyflow/react";
import { default as globalTypesReducer } from "./reducers/global-types.reducer";
import tableToNodesReducer from "./reducers/table-to-node.reducer";

const rootReducer = combineReducers({
  workspace: workspaceReducer,
  nodes: nodesReducer,
  types: globalTypesReducer,
  contextNodes: tableToNodesReducer,
});

const persistConfig: PersistConfig<{
  workspace: ReturnType<typeof workspaceReducer>;
  nodes: ReturnType<typeof nodesReducer>;
  types: ReturnType<typeof globalTypesReducer>;
  contextNodes: ReturnType<typeof tableToNodesReducer>;
}> = {
  key: "root",
  // whitelist: ["workspace", "types"],
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

export const settingsSelector = (state: {
  workspace: ReturnType<typeof workspaceReducer>;
}) => {
  return state.workspace.settings;
};

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
  const gnodeEntries = [...Object.entries(state.nodes.groupNodes)];
  const resultGnodes: StatefulNodeType[] = [];
  const resultNodes: StatefulNodeType[] = [];

  for (const [key, value] of gnodeEntries) {
    for (const [k, v] of [...Object.entries(value.nodes)]) {
      resultNodes.push({ ...v, id: k, parentId: key });
    }
    let res: StatefulNodeType = {
      ...value,
      id: key,
      type: "group",
      data: { ...value.data, type: "table", columnName: "" },
    };
    if ("nodes" in res) {
      delete res["nodes"];
    }
    resultGnodes.push(res);
  }

  return [...resultGnodes, ...resultNodes];
};

export const edgesSelector: (state: {
  nodes: ReturnType<typeof nodesReducer>;
}) => Edge[] = (state) => {
  const result: Edge[] = [];
  for (const [k, v] of [...Object.entries(state.nodes.edges)]) {
    result.push({ ...v, id: k });
  }
  return result;
};

export const nodeSelector =
  (id: string) => (state: { nodes: ReturnType<typeof nodesReducer> }) => {
    let gNode = state.nodes.groupNodes[id];
    let resNode = Object.fromEntries(
      Object.entries(gNode).filter(([k, v]) => {
        return k !== "nodes";
      })
    );
    return resNode;
  };

export const childNodePositionSelector =
  (id: string, parentID: string | undefined) =>
  (state: { nodes: ReturnType<typeof nodesReducer> }) => {
    if (!parentID) return -1;
    let gNode = state.nodes.groupNodes[parentID];
    const gNodeKeys = Object.keys(gNode.nodes).sort((a, b) => +a - +b);

    return gNodeKeys.indexOf(id);
  };

export const subsetNodesSelector =
  (ids: Set<string>) => (state: { nodes: ReturnType<typeof nodesReducer> }) => {
    const result = [];
    const allNodes = nodesSelector(state);
    for (const node of allNodes) {
      if (ids.has(node.id)) {
        result.push(node);
      }
    }

    return result;
  };

export const nodeChildrenLengthSelector =
  (id: string) => (state: { nodes: ReturnType<typeof nodesReducer> }) => {
    let childrenLength = [...Object.values(state.nodes.groupNodes[id]?.nodes)]
      .length;

    return childrenLength;
  };

// TYPES SELECTORS

export const typeDefaultSelector = (state: {
  types: ReturnType<typeof globalTypesReducer>;
}) => {
  return state.types.defaults;
};

export const typeErrorStateSelector = (state: {
  types: ReturnType<typeof globalTypesReducer>;
}) => {
  const res = {errorState: state.types.errorState, errorMessage: state.types.errorMessage}
  return res;
};

export const typeMappingSelector = (state: {
  types: ReturnType<typeof globalTypesReducer>;
}) => {
  return state.types.typeMappings;
};

// CONTEXT NODES SELECTORS

export const ContextNodesSelector = (state: {
  nodes: ReturnType<typeof tableToNodesReducer>;
}) => {
  const keyLen = Object.keys(state.nodes.groupNodes).length;
  return keyLen > 0 ? state.nodes.groupNodes : null;
};

export const ContextGroupNodeSelector = (groupNodeID: string) => (state: {
  nodes: ReturnType<typeof tableToNodesReducer>;
}) => {
  const result = state.nodes.groupNodes[groupNodeID];
  return result;
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

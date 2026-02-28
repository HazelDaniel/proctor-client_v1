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
import { NodeCompositeID, StatefulNodeType } from "./types";
import { Edge } from "@xyflow/react";
import { default as globalTypesReducer } from "./reducers/global-types.reducer";
import tableToNodesReducer from "./reducers/table-to-node.reducer";
import { compositionReducer } from "./reducers/composition.reducer";
import { parseNodeID } from "./utils/node.utils";
import { graphReducer } from "./reducers/graph.reducer";
import { updateFormModalReducer } from "./reducers/update-form-modal.reducer";
import authReducer from "./reducers/auth.reducer";
import { notificationReducer } from "./reducers/notification.reducer";
import { chatReducer } from "./reducers/chat.reducer";

const rootReducer = combineReducers({
  workspace: workspaceReducer,
  nodes: nodesReducer,
  types: globalTypesReducer,
  contextNodes: tableToNodesReducer,
  composition: compositionReducer,
  graphs: graphReducer,
  tableUpdateModal: updateFormModalReducer,
  auth: authReducer,
  notification: notificationReducer,
  chat: chatReducer,
});

const persistConfig: PersistConfig<{
  workspace: ReturnType<typeof workspaceReducer>;
  nodes: ReturnType<typeof nodesReducer>;
  types: ReturnType<typeof globalTypesReducer>;
  contextNodes: ReturnType<typeof tableToNodesReducer>;
  composition: ReturnType<typeof compositionReducer>;
  graphs: ReturnType<typeof graphReducer>;
  tableUpdateModal: ReturnType<typeof updateFormModalReducer>;
  auth: ReturnType<typeof authReducer>;
  notification: ReturnType<typeof notificationReducer>;
  chat: ReturnType<typeof chatReducer>;
}> = {
  key: "root",
  // whitelist: ["workspace", "types"],
  whitelist: ["workspace", "auth", "notification"],
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

export const compositionSelector = (state: {
  composition: ReturnType<typeof compositionReducer>;
}) => {
  return state.composition;
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

// GRAPH SELECTORS
export const graphSelector = (state: {
  graphs: ReturnType<typeof graphReducer>;
}) => {
  return state.graphs;
};

// TABLE UPDATE MODAL SELECTORS
export const tableUpdateModalSelector = (state: {
  tableUpdateModal: ReturnType<typeof updateFormModalReducer>;
}) => {
  return state.tableUpdateModal;
};

// NODES SELECTORS

export const nodesStateSelector = (state: {nodes: ReturnType<typeof nodesReducer>;}) => {
  return state.nodes;
}

export const nodesGroupSelector = (state: {nodes: ReturnType<typeof nodesReducer>;}) => {
  return state.nodes.groupNodes;
};

export const nodesSelector = (state: {
  nodes: ReturnType<typeof nodesReducer>;
}) => {
  const gnodeEntries = [...Object.entries(state.nodes.groupNodes)];
  const resultGnodes: StatefulNodeType[] = [];
  const resultNodes: StatefulNodeType[] = [];
  console.log("computing nodes");

  for (const [key, value] of gnodeEntries) {
    for (const [k, v] of [...Object.entries(value.nodes)]) {
      resultNodes.push({ ...v, id: k, parentId: key });
    }
    const res: StatefulNodeType = {
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

export const groupNodeSelector =
  (id: string) => (state: { nodes: ReturnType<typeof nodesReducer> }) => {
    const gNode = state.nodes.groupNodes[id];

    return gNode;
  };

export const referenceNodesSelector = (state: {
  nodes: ReturnType<typeof nodesReducer>;
}) => {
  const groupNodes = Object.values(state.nodes.groupNodes);

  return groupNodes.map((el) => {
    return {
      id: el.id,
      label: el.data.label,
      referenceNodes: Object.keys(el.referenceNodes) as NodeCompositeID[],
    };
  });
};

export const nodeSelector =
  (id: string) => (state: { nodes: ReturnType<typeof nodesReducer> }) => {
    const gNode = state.nodes.groupNodes[id];
    const resNode = Object.fromEntries(
      Object.entries(gNode).filter(([k, v]) => {
        return k !== "nodes";
      })
    );
    return resNode;
  };

export const savedTableSelector = (state: {
  contextNodes: ReturnType<typeof tableToNodesReducer>;
}) => {
  return state.contextNodes.savedTable;
};

export const activeNodeSelector = (state: {
  nodes: ReturnType<typeof nodesReducer>;
}) => {
  return state.nodes.activeNode;
};

export const childNodePositionSelector =
  (id: string, parentID: string | undefined) =>
  (state: { nodes: ReturnType<typeof nodesReducer> }) => {
    if (!parentID) return -1;
    const gNode = state.nodes.groupNodes[parentID];
    if (!gNode) return -1;
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
    try {
      // for some unknown reason, this one is erroring in dev mode so i just put it in a try-catch for now
      const childrenLength = [
        ...Object.values(state.nodes.groupNodes[id]?.nodes),
      ].length;
      return childrenLength;
    } catch (err) {
      return 0;
    }
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
  const res = {
    errorState: state.types.errorState,
    errorMessage: state.types.errorMessage,
  };
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

export const ContextGroupNodeSelector =
  (groupNodeID: string) =>
  (state: { nodes: ReturnType<typeof tableToNodesReducer> }) => {
    const result = state.nodes.groupNodes[groupNodeID];
    return result;
  };

// COMPOSITION SELECTORS

export const selectCompositionRep = (compositeID: NodeCompositeID) => {
  const [parentID, _2] = parseNodeID(compositeID);
  const state = store.getState();
  if (!state.composition[parentID]) return null;
  const nodesVal = Object.entries(state.composition[parentID]);
  for (const [key, val] of nodesVal) {
    if (compositeID in val) return key;
  }
  return null;
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// NOTES
// NOTE: - only the column.id fields of the nodes are used in the business logic

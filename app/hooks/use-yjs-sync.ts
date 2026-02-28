import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Y from 'yjs';
import {
  nodesGroupSelector,
  graphSelector,
  compositionSelector,
  typeMappingSelector,
} from '~/store';
import { isEqual } from '~/utils/comparison';
import { useCollaboration } from '~/contexts/collaboration.context';
import { addEdge, createGraph } from '~/utils/graph.utils';
import { parseNodeID } from '~/utils/node.utils';

import { Edge } from '@xyflow/react';
import { setNodesState } from '~/reducers/nodes.reducer';
import { setGraphState } from '~/reducers/graph.reducer';
import { setCompositionState } from '~/reducers/composition.reducer';
import { syncGroupNodes } from '~/reducers/table-to-node.reducer';
import { setTypeMappings } from '~/reducers/global-types.reducer';
import { StatefulGroupNodeType, TableGraphStateType, CompositionStateType, NodeCompositeID } from '~/types';

// Origin tag for transactions initiated by the local Redux→Yjs push.
// Yjs observers that see this origin will skip dispatching back to Redux.
const ORIGIN_LOCAL = 'local-redux';

/**
 * Hook to synchronize Redux state with Yjs document.
 * Handles bidirectional sync: Redux → Yjs and Yjs → Redux.
 *
 * Key design decisions:
 *  - Uses `doc.transact(fn, ORIGIN_LOCAL)` so Yjs→Redux observers can
 *    skip callbacks triggered by local writes (prevents infinite loops).
 *  - Handles deletions: keys present in Y.Map but absent in Redux are removed.
 *  - Groups nodes sync uses `nodesGroupSelector` (raw `groupNodes` object)
 *    instead of the flattened `nodesSelector` array.
 *  - Node position drags are debounced at 50ms to avoid flooding the Y.Doc.
 */
export const useYjsSync = (
  edges: Edge[],
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
) => {
  const dispatch = useDispatch();
  const { doc, connected, synced } = useCollaboration();

  // Redux selectors — groupNodes is the raw { [groupId]: GroupNode } object
  const groupNodes = useSelector(nodesGroupSelector, isEqual);
  const graph = useSelector(graphSelector, isEqual);
  const composition = useSelector(compositionSelector, isEqual);
  const typeMappings = useSelector(typeMappingSelector, isEqual);

  // Debounce timer for node position sync (high-frequency during drag)
  const positionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracks whether the initial Yjs→Redux hydration has been dispatched.
  // Using useState (not useRef) so that setting it triggers a NEW render,
  // giving Redux selectors time to reflect the hydrated data before
  // Redux→Yjs push effects run.
  const [hydrated, setHydrated] = useState(false);

  // ──────────────────────────────────────────────────────────
  //  Yjs → Redux  (observe remote changes, dispatch to Redux)
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !synced) return;

    console.log('[YjsSync] Setting up Yjs → Redux observers (synced)');

    const yGroupNodes = doc.getMap<any>('groupNodes');
    const yEdges = doc.getMap<any>('edges');
    const yGraphs = doc.getMap<any>('graphs');
    const yComposition = doc.getMap<any>('composition');
    const yTypeMappings = doc.getMap<any>('typeMappings');

    // We listen to the doc 'update' event to detect changes from remote peers.
    // Transactions originated locally (ORIGIN_LOCAL) are skipped.
    // Using observeDeep on each map gives us finer-grained events,
    // but doc.on('afterTransaction') is simpler and avoids interleaving issues.
    const handleTransaction = (txn: Y.Transaction) => {
      // Skip transactions we originated ourselves (Redux → Yjs writes).
      if (txn.origin === ORIGIN_LOCAL) return;

      // A remote transaction arrived. Re-read all shared state.
      // This is safe because:
      // - We only run this for remote origins (not ORIGIN_LOCAL)
      // - The Redux→Yjs direction uses isEqual checks, so dispatching
      //   unchanged state won't cause another write back to Yjs.
      const remoteGroupNodes = yGroupNodes.toJSON() as StatefulGroupNodeType;
      dispatch(setNodesState({ groupNodes: remoteGroupNodes }));
      // Also sync into contextNodes so download/edit works for remote tables
      dispatch(syncGroupNodes(remoteGroupNodes));

      const remoteEdges = Array.from(yEdges.values()) as Edge[];
      setEdges(remoteEdges);

      const remoteGraphMap = yGraphs.get('current');
      let remoteGraph: TableGraphStateType | undefined;
      if (remoteGraphMap) {
        remoteGraph = (remoteGraphMap instanceof Y.AbstractType ? remoteGraphMap.toJSON() : remoteGraphMap) as TableGraphStateType;
      }

      // Self-healing: reconstruct graph if empty but edges exist
      if ((!remoteGraph || Object.keys(remoteGraph.nodes.adjList).length === 0) && remoteEdges.length > 0) {
        const healedGraph: TableGraphStateType = {
          tables: createGraph(),
          nodes: createGraph(),
        };
        remoteEdges.forEach((edge) => {
          addEdge(healedGraph.nodes, edge.source, edge.target);
          const [sourceTable] = parseNodeID(edge.source as NodeCompositeID);
          const [targetTable] = parseNodeID(edge.target as NodeCompositeID);
          if (sourceTable && targetTable) {
            addEdge(healedGraph.tables, sourceTable, targetTable);
          }
        });
        remoteGraph = healedGraph;
      }

      if (remoteGraph) {
        dispatch(setGraphState(remoteGraph));
      }

      const remoteComposition = yComposition.toJSON() as CompositionStateType;
      dispatch(setCompositionState(remoteComposition));

      const remoteTypeMappings = yTypeMappings.toJSON() as Record<string, string[]>;
      dispatch(setTypeMappings(remoteTypeMappings));
    };

    doc.on('afterTransaction', handleTransaction);

    // Hydrate local/Redux state from the current Yjs maps immediately.
    // The initial server sync may have already been applied to the Y.Doc
    // before this observer was registered, so we read the current state now.
    const initialGroupNodes = yGroupNodes.toJSON() as StatefulGroupNodeType;
    if (Object.keys(initialGroupNodes).length > 0) {
      dispatch(setNodesState({ groupNodes: initialGroupNodes }));
      dispatch(syncGroupNodes(initialGroupNodes));
    }

    const initialEdges = Array.from(yEdges.values()) as Edge[];
    if (initialEdges.length > 0) {
      setEdges(initialEdges);
    }

    const initialGraphMap = yGraphs.get('current');
    let initialGraph: TableGraphStateType | undefined;
    if (initialGraphMap) {
      initialGraph = (initialGraphMap instanceof Y.AbstractType ? initialGraphMap.toJSON() : initialGraphMap) as TableGraphStateType;
    }

    // Self-healing: reconstruct graph if empty but edges exist
    if ((!initialGraph || Object.keys(initialGraph.nodes.adjList).length === 0) && initialEdges.length > 0) {
      const healedGraph: TableGraphStateType = {
        tables: createGraph(),
        nodes: createGraph(),
      };
      initialEdges.forEach((edge) => {
        addEdge(healedGraph.nodes, edge.source, edge.target);
        const [sourceTable] = parseNodeID(edge.source as NodeCompositeID);
        const [targetTable] = parseNodeID(edge.target as NodeCompositeID);
        if (sourceTable && targetTable) {
          addEdge(healedGraph.tables, sourceTable, targetTable);
        }
      });
      initialGraph = healedGraph;
    }

    if (initialGraph) {
      dispatch(setGraphState(initialGraph));
    }

    const initialComposition = yComposition.toJSON() as CompositionStateType;
    if (Object.keys(initialComposition).length > 0) {
      dispatch(setCompositionState(initialComposition));
    }

    const initialTypeMappings = yTypeMappings.toJSON() as Record<string, string[]>;
    if (Object.keys(initialTypeMappings).length > 0) {
      dispatch(setTypeMappings(initialTypeMappings));
    }

    // Signal that Yjs→Redux hydration is done. This triggers a new
    // render cycle so Redux→Yjs effects see the freshly-populated selectors.
    setHydrated(true);

    return () => {
      doc.off('afterTransaction', handleTransaction);
    };
  }, [doc, synced, dispatch, setEdges]);

  // Track latest groupNodes in a ref so the setTimeout closure never deletes
  // newly arrived nodes just because it captured an old empty state.
  const latestGroupNodes = useRef(groupNodes);
  useEffect(() => {
    latestGroupNodes.current = groupNodes;
  }, [groupNodes]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync groupNodes
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected || !hydrated) return;

    const yGroupNodes = doc.getMap<any>('groupNodes');

    // Debounce position-heavy updates by 50ms
    if (positionTimerRef.current) {
      clearTimeout(positionTimerRef.current);
    }

    positionTimerRef.current = setTimeout(() => {
      doc.transact(() => {
        const currentReduxNodes = latestGroupNodes.current;
        const reduxKeys = new Set(Object.keys(currentReduxNodes));

        // Add/update entries
        for (const [key, value] of Object.entries(currentReduxNodes)) {
          const current = yGroupNodes.get(key);
          if (!isEqual(current, value)) {
            // Store as a plain JSON value — not a nested Y.Map —
            // because the existing observers use .toJSON() to read back,
            // and nested Y.Maps would require deep recursive construction
            // which adds complexity without benefit for this data shape.
            yGroupNodes.set(key, value);
          }
        }

        // Delete entries that no longer exist in Redux
        for (const key of yGroupNodes.keys()) {
          if (!reduxKeys.has(key)) {
            yGroupNodes.delete(key);
          }
        }
      }, ORIGIN_LOCAL);
    }, 50);

    return () => {
      if (positionTimerRef.current) {
        clearTimeout(positionTimerRef.current);
      }
    };
  }, [doc, connected, hydrated, groupNodes]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync edges
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected || !hydrated) return;

    const yEdges = doc.getMap<any>('edges');

    doc.transact(() => {
      const reduxEdgeKeys = new Set(edges.map((e) => e.id));

      // Add/update edges
      for (const edge of edges) {
        const current = yEdges.get(edge.id);
        if (!isEqual(current, edge)) {
          yEdges.set(edge.id, edge);
        }
      }

      // Delete edges that no longer exist locally
      for (const key of yEdges.keys()) {
        if (!reduxEdgeKeys.has(key)) {
          yEdges.delete(key);
        }
      }
    }, ORIGIN_LOCAL);
  }, [doc, connected, hydrated, edges]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync graph state
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected || !hydrated) return;

    const yGraphs = doc.getMap<any>('graphs');

    doc.transact(() => {
      const graphData = typeof graph === 'object' ? graph : {};
      const current = yGraphs.get('current');
      if (!isEqual(current, graphData)) {
        yGraphs.set('current', graphData);
      }
    }, ORIGIN_LOCAL);
  }, [doc, connected, hydrated, graph]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync composition state
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected || !hydrated) return;

    const yComposition = doc.getMap<any>('composition');

    doc.transact(() => {
      const compositionData = typeof composition === 'object' ? composition : {};
      const reduxKeys = new Set(Object.keys(compositionData));

      // Add/update entries
      for (const [key, value] of Object.entries(compositionData)) {
        const current = yComposition.get(key);
        if (!isEqual(current, value)) {
          yComposition.set(key, value);
        }
      }

      // Delete entries that no longer exist
      for (const key of yComposition.keys()) {
        if (!reduxKeys.has(key)) {
          yComposition.delete(key);
        }
      }
    }, ORIGIN_LOCAL);
  }, [doc, connected, hydrated, composition]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync typeMappings (Enums)
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected || !hydrated || !typeMappings) return;

    const yTypeMappings = doc.getMap<any>('typeMappings');

    doc.transact(() => {
      const reduxKeys = new Set(Object.keys(typeMappings));

      // Add/update entries
      for (const [key, value] of Object.entries(typeMappings)) {
        const current = yTypeMappings.get(key);
        if (!isEqual(current, value)) {
          yTypeMappings.set(key, value);
        }
      }

      // Delete entries that no longer exist
      for (const key of yTypeMappings.keys()) {
        if (!reduxKeys.has(key)) {
          yTypeMappings.delete(key);
        }
      }
    }, ORIGIN_LOCAL);
  }, [doc, connected, hydrated, typeMappings]);
};

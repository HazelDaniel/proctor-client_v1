import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Y from 'yjs';
import {
  nodesGroupSelector,
  graphSelector,
  compositionSelector,
} from '~/store';
import { isEqual } from '~/utils/comparison';
import { useCollaboration } from '~/contexts/collaboration.context';

import { Edge } from '@xyflow/react';
import { setNodesState } from '~/reducers/nodes.reducer';
import { setGraphState } from '~/reducers/graph.reducer';
import { setCompositionState } from '~/reducers/composition.reducer';
import { syncGroupNodes } from '~/reducers/table-to-node.reducer';
import { StatefulGroupNodeType, TableGraphStateType, CompositionStateType } from '~/types';

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
  const { doc, connected } = useCollaboration();

  // Redux selectors — groupNodes is the raw { [groupId]: GroupNode } object
  const groupNodes = useSelector(nodesGroupSelector, isEqual);
  const graph = useSelector(graphSelector, isEqual);
  const composition = useSelector(compositionSelector, isEqual);

  // Debounce timer for node position sync (high-frequency during drag)
  const positionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ──────────────────────────────────────────────────────────
  //  Yjs → Redux  (observe remote changes, dispatch to Redux)
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected) return;

    console.log('[YjsSync] Setting up Yjs → Redux observers');

    const yGroupNodes = doc.getMap<any>('groupNodes');
    const yEdges = doc.getMap<any>('edges');
    const yGraphs = doc.getMap<any>('graphs');
    const yComposition = doc.getMap<any>('composition');

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

      const remoteGraph = yGraphs.get('current') as TableGraphStateType | undefined;
      if (remoteGraph) {
        dispatch(setGraphState(remoteGraph));
      }

      const remoteComposition = yComposition.toJSON() as CompositionStateType;
      dispatch(setCompositionState(remoteComposition));
    };

    doc.on('afterTransaction', handleTransaction);

    return () => {
      doc.off('afterTransaction', handleTransaction);
    };
  }, [doc, connected, dispatch, setEdges]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync groupNodes
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected) return;

    const yGroupNodes = doc.getMap<any>('groupNodes');

    // Debounce position-heavy updates by 50ms
    if (positionTimerRef.current) {
      clearTimeout(positionTimerRef.current);
    }

    positionTimerRef.current = setTimeout(() => {
      doc.transact(() => {
        const reduxKeys = new Set(Object.keys(groupNodes));

        // Add/update entries
        for (const [key, value] of Object.entries(groupNodes)) {
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
  }, [doc, connected, groupNodes]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync edges
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected) return;

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
  }, [doc, connected, edges]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync graph state
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected) return;

    const yGraphs = doc.getMap<any>('graphs');

    doc.transact(() => {
      const graphData = typeof graph === 'object' ? graph : {};
      const current = yGraphs.get('current');
      if (!isEqual(current, graphData)) {
        yGraphs.set('current', graphData);
      }
    }, ORIGIN_LOCAL);
  }, [doc, connected, graph]);

  // ──────────────────────────────────────────────────────────
  //  Redux → Yjs: Sync composition state
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !connected) return;

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
  }, [doc, connected, composition]);
};

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Y from 'yjs';
import {
  nodesSelector,
  edgesSelector,
  graphSelector,
  compositionSelector,
} from '~/store';
import { isEqual } from '~/utils/comparison';
import { useCollaboration } from '~/contexts/collaboration.context';

/**
 * Hook to synchronize Redux state with Yjs document
 * Handles bidirectional sync: Redux -> Yjs and Yjs -> Redux
 */
export const useYjsSync = () => {
  const dispatch = useDispatch();
  const { doc, connected } = useCollaboration();

  // Redux selectors
  const nodes = useSelector(nodesSelector, isEqual);
  const edges = useSelector(edgesSelector, isEqual);
  const graph = useSelector(graphSelector, isEqual);
  const composition = useSelector(compositionSelector, isEqual);

  // Track if we're currently applying Yjs updates to prevent loops
  const applyingYjsUpdate = useRef(false);

  useEffect(() => {
    if (!doc || !connected) return;

    console.log('[YjsSync] Initializing Yjs synchronization');

    // Get or create shared types
    const yGroupNodes = doc.getMap<Y.Map<any>>('groupNodes');
    const yEdges = doc.getMap('edges');
    const yGraphs = doc.getMap('graphs');
    const yComposition = doc.getMap('composition');

    // Observe Yjs changes and log for now
    const handleGroupNodesChange = (event: Y.YMapEvent<Y.Map<any>>) => {
      if (applyingYjsUpdate.current) return;
      console.log('[YjsSync] Group nodes changed:', event.keysChanged);
       // TODO: Dispatch Redux actions to update local state
    };

    const handleEdgesChange = (event: Y.YMapEvent<any>) => {
      if (applyingYjsUpdate.current) return;
      console.log('[YjsSync] Edges changed:', event.keysChanged);
      // TODO: Dispatch Redux actions to update local state
    };

    const handleGraphsChange = (event: Y.YMapEvent<any>) => {
      if (applyingYjsUpdate.current) return;
      console.log('[YjsSync] Graphs changed:', event.keysChanged);
    };

    const handleCompositionChange = (event: Y.YMapEvent<any>) => {
      if (applyingYjsUpdate.current) return;
      console.log('[YjsSync] Composition changed:', event.keysChanged);
    };

    yGroupNodes.observe(handleGroupNodesChange);
    yEdges.observe(handleEdgesChange);
    yGraphs.observe(handleGraphsChange);
    yComposition.observe(handleCompositionChange);

    return () => {
      yGroupNodes.unobserve(handleGroupNodesChange);
      yEdges.unobserve(handleEdgesChange);
      yGraphs.unobserve(handleGraphsChange);
      yComposition.unobserve(handleCompositionChange);
    };
  }, [doc, connected, dispatch]);

  // Sync Redux -> Yjs when Redux state changes
  useEffect(() => {
    if (!doc || !connected || applyingYjsUpdate.current) return;

    const yGroupNodes = doc.getMap<Y.Map<any>>('groupNodes');

    doc.transact(() => {
      // Sync nodes from Redux to Yjs
      const groupNodes = (nodes as any).groupNodes || {};
      Object.entries(groupNodes).forEach(
        ([key, value]: [string, any]) => {
          let yNode = yGroupNodes.get(key);
          if (!yNode) {
            yNode = new Y.Map();
            yGroupNodes.set(key, yNode);
          }

          // Deep set all properties
          Object.entries(value).forEach(([prop, val]) => {
            const currentVal = yNode!.get(prop);
            if (!isEqual(currentVal, val)) {
              yNode!.set(prop, val);
            }
          });
        }
      );
    }, 'redux');
  }, [doc, connected, nodes]);

  useEffect(() => {
    if (!doc || !connected || applyingYjsUpdate.current) return;

    const yEdges = doc.getMap('edges');

    doc.transact(() => {
      // Sync edges from Redux to Yjs
      edges.forEach((edge) => {
        const edgeKey = edge.id;
        const currentEdge = yEdges.get(edgeKey);
        
        if (!isEqual(currentEdge, edge)) {
          yEdges.set(edgeKey, edge);
        }
      });
    }, 'redux');
  }, [doc, connected, edges]);

  useEffect(() => {
    if (!doc || !connected || applyingYjsUpdate.current) return;

    const yGraphs = doc.getMap('graphs');

    doc.transact(() => {
      // Sync graphs from Redux to Yjs
      const graphData = typeof graph === 'object' ? graph : {};
      const currentGraph = yGraphs.get('current');
      
      if (!isEqual(currentGraph, graphData)) {
        yGraphs.set('current', graphData);
      }
    }, 'redux');
  }, [doc, connected, graph]);

  useEffect(() => {
    if (!doc || !connected || applyingYjsUpdate.current) return;

    const yComposition = doc.getMap('composition');

    doc.transact(() => {
      // Sync composition from Redux to Yjs
      const compositionData = typeof composition === 'object' ? composition : {};
      
      Object.entries(compositionData).forEach(([key, value]) => {
        const currentComp = yComposition.get(key);
        if (!isEqual(currentComp, value)) {
          yComposition.set(key, value);
        }
      });
    }, 'redux');
  }, [doc, connected, composition]);
};

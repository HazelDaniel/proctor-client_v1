import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';

import type { Awareness } from 'y-protocols/awareness';
import { API_BASE_URL } from '../utils/config';
import {
  createDecoder,
  readVarUint,
  readVarUint8Array,
} from 'lib0/decoding';
import {
  createEncoder,
  writeVarUint,
  writeVarUint8Array,
  toUint8Array,
  length as encoderLength,
} from 'lib0/encoding';
import {
  readSyncMessage,
  writeSyncStep1,
  writeUpdate,
} from 'y-protocols/sync';
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';

export interface CollaborationContextValue {
  doc: Y.Doc | null;
  awareness: Awareness | null;
  socket: Socket | null;
  connected: boolean;
  synced: boolean;
  instanceId: string | null;
}

const CollaborationContext = createContext<CollaborationContextValue | null>(
  null
);

export const useCollaboration = (): CollaborationContextValue => {
  const context = useContext(CollaborationContext);
  if (!context) {
    // Return safe null values instead of throwing
    // This allows components to work even without the provider
    console.error("no collaboration context set!");
    return {
      doc: null,
      awareness: null,
      socket: null,
      connected: false,
      synced: false,
      instanceId: null,
    };
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
  instanceId: string;
  token: string;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  instanceId,
  token,
}) => {
  const [doc] = useState(() => new Y.Doc());
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const [connected, setConnected] = useState(false);
  const [synced, setSynced] = useState(false);
  const syncedRef = useRef(false);
  // Reactive socket state ensures downstream consumers (e.g. WorkspaceHeader)
  // re-run their effects when the socket becomes available.
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    import('y-protocols/awareness').then(({ Awareness }) => {
      setAwareness(new Awareness(doc));
    });
  }, [doc]);

  useEffect(() => {
    if (!awareness) return;

    // Connect to the backend Yjs gateway
    const newSocket = io(API_BASE_URL, {
      path: '/collab',
      transports: ['websocket', 'polling'],
      auth: {
        instanceId,
        token,
      },
    });

    // Expose the socket as reactive state immediately after creation so
    // subscribers can attach listeners before the first server event fires.
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Collaboration] Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Collaboration] Disconnected from server');
      setConnected(false);
      syncedRef.current = false;
      setSynced(false);
    });

    newSocket.on('yjs:ready', ({ docId, toolType }) => {
      console.log(`[Collaboration] Document ready: ${docId}, tool: ${toolType}`);
    });

    newSocket.on('yjs:sync', (data: ArrayBuffer | Uint8Array) => {
      const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
      const decoder = createDecoder(u8);
      const msgType = readVarUint(decoder);

      if (msgType === 0) { // MSG_SYNC
        const encoder = createEncoder();
        writeVarUint(encoder, 0);

        const syncMessageType = readSyncMessage(decoder, encoder, doc, newSocket);

        // If there's a reply, send it back
        const reply = toUint8Array(encoder);
        if (encoderLength(encoder) > 1) {
          newSocket.emit('yjs:sync', reply);
        }

        // Mark as synced only after receiving SyncStep2 (type 1) which
        // contains the actual document data. SyncStep1 (type 0) is just
        // a state-vector exchange and the Y.Doc is still empty at that point.
        if (!syncedRef.current && syncMessageType === 1) {
          syncedRef.current = true;
          setSynced(true);
          console.log('[Collaboration] Initial Yjs sync complete (SyncStep2 received)');
        }
      }
    });

    newSocket.on('yjs:awareness', (data: ArrayBuffer | Uint8Array) => {
      const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
      const decoder = createDecoder(u8);
      const msgType = readVarUint(decoder);
      if (msgType === 1) { // MSG_AWARENESS
        const update = readVarUint8Array(decoder);
        applyAwarenessUpdate(awareness, update, newSocket);
      }
    });

    // Broadcast local awareness updates
    const handleAwarenessUpdate = ({ added, updated, removed }: any, origin: any) => {
      if (origin !== newSocket) {
        const changed = added.concat(updated, removed);
        const update = encodeAwarenessUpdate(awareness, changed);
        const encoder = createEncoder();
        writeVarUint(encoder, 1); // MSG_AWARENESS
        writeVarUint8Array(encoder, update);
        newSocket.emit('yjs:awareness', toUint8Array(encoder));
      }
    };
    awareness.on('update', handleAwarenessUpdate);

    // Broadcast local Yjs updates to the server
    const handleDocUpdate = (update: Uint8Array, origin: any) => {
      if (origin !== newSocket) {
        const encoder = createEncoder();
        writeVarUint(encoder, 0); // MSG_SYNC
        writeUpdate(encoder, update);
        newSocket.emit('yjs:sync', toUint8Array(encoder));
      }
    };
    doc.on('update', handleDocUpdate);

    // Send initial sync and local awareness when server is ready (docId bound)
    const handleReady = () => {
      // 1. Send Sync Step 1
      const syncEncoder = createEncoder();
      writeVarUint(syncEncoder, 0); // MSG_SYNC
      writeSyncStep1(syncEncoder, doc);
      newSocket.emit('yjs:sync', toUint8Array(syncEncoder));

      // 2. Send Local Awareness State
      const awarenessEncoder = createEncoder();
      writeVarUint(awarenessEncoder, 1); // MSG_AWARENESS
      const update = encodeAwarenessUpdate(awareness, [awareness.clientID]);
      writeVarUint8Array(awarenessEncoder, update);
      newSocket.emit('yjs:awareness', toUint8Array(awarenessEncoder));
    };
    newSocket.on('yjs:ready', handleReady);

    return () => {
      newSocket.off('yjs:ready', handleReady);
      doc.off('update', handleDocUpdate);
      awareness.off('update', handleAwarenessUpdate);
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
      syncedRef.current = false;
      setSynced(false);
    };
  }, [instanceId, token, doc, awareness]);

  const value: CollaborationContextValue = {
    doc,
    awareness,
    socket,
    connected,
    synced,
    instanceId,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

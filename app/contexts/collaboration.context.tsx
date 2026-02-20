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

export interface CollaborationContextValue {
  doc: Y.Doc | null;
  awareness: Awareness | null;
  socket: Socket | null;
  connected: boolean;
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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    import('y-protocols/awareness').then(({ Awareness }) => {
      setAwareness(new Awareness(doc));
    });
  }, [doc]);

  useEffect(() => {
    if (!awareness) return;

    // Connect to the backend Yjs gateway
    const socket = io('http://localhost:3000', {
      path: '/collab',
      auth: {
        instanceId,
        token,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Collaboration] Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Collaboration] Disconnected from server');
      setConnected(false);
    });

    socket.on('yjs:ready', ({ docId, toolType }) => {
      console.log(`[Collaboration] Document ready: ${docId}, tool: ${toolType}`);
    });

    socket.on('yjs:sync', (data: ArrayBuffer | Uint8Array) => {
      const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
      
      // Apply sync message to the Yjs doc
      import('lib0/decoding').then(({ createDecoder, readVarUint }) => {
        import('lib0/encoding').then(({ createEncoder, writeVarUint, toUint8Array }) => {
          import('y-protocols/sync').then(({ readSyncMessage }) => {
            const decoder = createDecoder(u8);
            const msgType = readVarUint(decoder);
            
            if (msgType === 0) { // MSG_SYNC
              const encoder = createEncoder();
              writeVarUint(encoder, 0);
              
              readSyncMessage(decoder, encoder, doc, socket);
              
              // If there's a reply, send it back
              const reply = toUint8Array(encoder);
              if (reply.length > 1) {
                socket.emit('yjs:sync', reply);
              }
            }
          });
        });
      });
    });

    socket.on('yjs:awareness', (data: ArrayBuffer | Uint8Array) => {
      const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
      import('lib0/decoding').then(({ createDecoder, readVarUint, readVarUint8Array }) => {
        import('y-protocols/awareness').then(({ applyAwarenessUpdate }) => {
          const decoder = createDecoder(u8);
          const msgType = readVarUint(decoder);
          if (msgType === 1) { // MSG_AWARENESS
            const update = readVarUint8Array(decoder);
            applyAwarenessUpdate(awareness, update, socket);
          }
        });
      });
    });

    // Broadcast local awareness updates
    const handleAwarenessUpdate = ({ added, updated, removed }: any, origin: any) => {
      if (origin !== socket) {
        import('lib0/encoding').then(({ createEncoder, writeVarUint, writeVarUint8Array, toUint8Array }) => {
          import('y-protocols/awareness').then(({ encodeAwarenessUpdate }) => {
            const changed = added.concat(updated, removed);
            const update = encodeAwarenessUpdate(awareness, changed);
            const encoder = createEncoder();
            writeVarUint(encoder, 1); // MSG_AWARENESS
            writeVarUint8Array(encoder, update);
            socket.emit('yjs:awareness', toUint8Array(encoder));
          });
        });
      }
    };
    awareness.on('update', handleAwarenessUpdate);

    // Broadcast local Yjs updates to the server
    const handleDocUpdate = (update: Uint8Array, origin: any) => {
      if (origin !== socket) {
        import('lib0/encoding').then(({ createEncoder, writeVarUint, toUint8Array }) => {
          import('y-protocols/sync').then(({ writeUpdate }) => {
            const encoder = createEncoder();
            writeVarUint(encoder, 0); // MSG_SYNC
            writeUpdate(encoder, update);
            socket.emit('yjs:sync', toUint8Array(encoder));
          });
        });
      }
    };
    doc.on('update', handleDocUpdate);

    // Send initial sync when connected
    socket.on('connect', () => {
      import('lib0/encoding').then(({ createEncoder, writeVarUint, toUint8Array }) => {
        import('y-protocols/sync').then(({ writeSyncStep1 }) => {
          const encoder = createEncoder();
          writeVarUint(encoder, 0); // MSG_SYNC
          writeSyncStep1(encoder, doc);
          socket.emit('yjs:sync', toUint8Array(encoder));
        });
      });
    });

    return () => {
      doc.off('update', handleDocUpdate);
      awareness.off('update', handleAwarenessUpdate);
      socket.disconnect();
      setConnected(false);
    };
  }, [instanceId, token, doc, awareness]);

  const value: CollaborationContextValue = {
    doc,
    awareness,
    socket: socketRef.current,
    connected,
    instanceId,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

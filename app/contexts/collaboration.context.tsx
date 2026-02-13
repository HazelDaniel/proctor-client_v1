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

export interface CollaborationContextValue {
  doc: Y.Doc | null;
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
    return {
      doc: null,
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
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
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
      // Awareness updates will be handled separately if needed
      console.log('[Collaboration] Awareness update received');
    });

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
      socket.disconnect();
      setConnected(false);
    };
  }, [instanceId, token, doc]);

  const value: CollaborationContextValue = {
    doc,
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

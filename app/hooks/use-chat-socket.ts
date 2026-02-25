import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, ChatMessage } from '../reducers/chat.reducer';
import { RootState } from '../store';
import { gqlRequest } from '../utils/api';

const FETCH_MESSAGES_QUERY = `
  query GetChatMessages($instanceId: String!, $limit: Int) {
    chatMessages(instanceId: $instanceId, limit: $limit) {
      id
      instanceId
      senderId
      content
      type
      metadata
      createdAt
    }
  }
`;

export function useChatSocket(instanceId: string) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !instanceId) return;

    const socket = io('http://localhost:3000/chat', {
      query: { instanceId },
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Chat socket connected for instance:', instanceId);
    });

    socket.on('chatMessage', (message: ChatMessage) => {
      // Append sender user details ideally, but for now we just dispatch what we get
      dispatch(addMessage({ instanceId, message }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [dispatch, isAuthenticated, instanceId]);

  const sendMessage = (content: string, type: string = 'normal', metadata: any = {}) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sendMessage', { content, type, metadata });
    }
  };

  return { sendMessage };
}

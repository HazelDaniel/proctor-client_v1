import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../reducers/notification.reducer';
import { RootState } from '../store';

export function useNotificationSocket() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to the /notifications namespace
    // Authentication relies on the HttpOnly `access_token` cookie sent automatically
    const socket: Socket = io('http://localhost:3000/notifications', {
      withCredentials: true,
      transports: ['websocket'], // Use websockets directly for better performance
    });

    socket.on('connect', () => {
      console.log('Notification socket connected');
    });

    socket.on('notification', (payload: any) => {
      console.log('Received real-time notification:', payload);
      dispatch(addNotification(payload));
    });

    socket.on('disconnect', () => {
      console.log('Notification socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, isAuthenticated]);
}

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../reducers/notification.reducer';
import { RootState } from '../store';
import { toast } from 'sonner';
import { API_BASE_URL } from '../utils/config';

export function useNotificationSocket() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to the /notifications namespace
    // Authentication relies on the HttpOnly `access_token` cookie sent automatically
    const socket: Socket = io(`${API_BASE_URL}/notifications`, {
      withCredentials: true,
      transports: ['websocket'], // Use websockets directly for better performance
    });

    socket.on('connect', () => {
      console.log('Notification socket connected');
    });

    socket.on('notification', (payload: any) => {
      console.log('Received real-time notification:', payload);
      dispatch(addNotification(payload));
      
      // Trigger toast
      const notification = typeof payload.payload === 'string' ? JSON.parse(payload.payload) : payload.payload;
      let message = 'You have a new notification';
      
      switch (payload.type) {
        case 'invite_received':
          message = `${notification.inviterEmail} invited you to ${notification.projectName}`;
          break;
        case 'invite_accepted':
          message = `${notification.accepterEmail} joined ${notification.projectName}`;
          break;
        case 'project_archived':
          message = `Project ${notification.projectName} has been archived`;
          break;
        case 'project_deleted':
          message = `Project ${notification.projectName} has been deleted`;
          break;
      }
      
      toast(message, {
        description: 'New Notification',
        action: {
          label: 'View',
          onClick: () => {
             if (payload.type === 'invite_received') {
                window.location.href = '/files?tab=invitations';
             } else if (payload.instanceId && payload.type !== 'project_deleted') {
                window.location.href = `/files/${payload.instanceId}`;
             }
          }
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('Notification socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, isAuthenticated]);
}

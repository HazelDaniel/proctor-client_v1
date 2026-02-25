import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationPayload {
  projectName?: string;
  inviterEmail?: string;
  accepterEmail?: string;
  [key: string]: any;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  payload: string | NotificationPayload; // Can be JSON string from GraphQL or parsed object
  read: boolean;
  createdAt: string;
  instanceId?: string;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.items = action.payload.map(n => ({
        ...n,
        // Ensure payload is parsed if it comes as a string from GraphQL
        payload: typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload,
      }));
    },
    addNotification(state, action: PayloadAction<NotificationItem>) {
      const parsed = {
        ...action.payload,
        payload: typeof action.payload.payload === 'string' 
          ? JSON.parse(action.payload.payload) 
          : action.payload.payload,
      };
      // Prepend to array
      state.items.unshift(parsed);
      state.unreadCount += 1;
    },
    markReadLocally(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllReadLocally(state) {
      state.items.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markReadLocally,
  markAllReadLocally,
  setUnreadCount,
} = notificationSlice.actions;

export const notificationReducer = notificationSlice.reducer;

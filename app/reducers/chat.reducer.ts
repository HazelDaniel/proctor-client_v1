import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  instanceId: string;
  senderId: string;
  content: string;
  createdAt: string;
  type?: 'normal' | 'bubble';
  metadata?: {
    x?: number;
    y?: number;
    bubbleId?: string;
  };
  sender?: {
    id: string;
    username?: string;
    avatarUrl?: string;
  };
}

interface ChatState {
  messagesByInstance: Record<string, ChatMessage[]>;
  isOpen: boolean;
}

const initialState: ChatState = {
  messagesByInstance: {},
  isOpen: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<{ instanceId: string; messages: ChatMessage[] }>) {
      const { instanceId, messages } = action.payload;
      state.messagesByInstance[instanceId] = messages;
    },
    addMessage(state, action: PayloadAction<{ instanceId: string; message: ChatMessage }>) {
      const { instanceId, message } = action.payload;
      if (!state.messagesByInstance[instanceId]) {
        state.messagesByInstance[instanceId] = [];
      }
      
      // Prevent duplicates by checking ID
      const exists = state.messagesByInstance[instanceId].some(m => m.id === message.id);
      if (!exists) {
        state.messagesByInstance[instanceId].push(message);
      }
    },
    toggleChat(state) {
      state.isOpen = !state.isOpen;
    },
    setChatOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    }
  },
});

export const { setMessages, addMessage, toggleChat, setChatOpen } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;

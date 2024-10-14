import React from "react";
import {
  ChatBubbleActionType,
  ChatBubbleStateType,
} from "~/reducers/chat-bubble.reducer";

export interface ChatBubbleContextValueType {
  chatBubbleState: ChatBubbleStateType;
  chatBubbleDispatch: React.Dispatch<ChatBubbleActionType<unknown>>;
}

export const chatBubbleContext =
  React.createContext<ChatBubbleContextValueType | null>(null);

export const ChatBubbleProvider = chatBubbleContext.Provider;
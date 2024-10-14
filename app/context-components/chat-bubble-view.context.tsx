import { ReactNode,  useMemo, useReducer } from "react"
import { ChatBubbleProvider, chatBubbleContext } from "~/contexts/chat-bubble.context";
import { chatBubbleReducer, initialChatBubbleState } from "~/reducers/chat-bubble.reducer"

export const ChatBubbleViewCtx: React.FC<{children: ReactNode}> = ({children}) => {
  const [chatBubbleState, chatBubbleDispatch] = useReducer(chatBubbleReducer, initialChatBubbleState);
  const chatBubbleValue = useMemo(() => ({chatBubbleState, chatBubbleDispatch}), [chatBubbleState])
  return <>
    <ChatBubbleProvider value={chatBubbleValue}>
      {children}
    </ChatBubbleProvider>
  </>
}
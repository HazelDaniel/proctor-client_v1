import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useChatSocket } from '../hooks/use-chat-socket';
import { setChatOpen } from '../reducers/chat.reducer';
import { X, Send, MessageSquare, MapPin } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { gqlRequest } from '../utils/api';
import { setMessages } from '../reducers/chat.reducer';
import { toast } from 'sonner';

const CHAT_HISTORY_QUERY = `
  query GetChatHistory($instanceId: String!, $limit: Int) {
    chatMessages(instanceId: $instanceId, limit: $limit) {
      id
      instanceId
      senderId
      content
      type
      metadata
      createdAt
      sender {
        id
        username
        avatarUrl
      }
    }
  }
`;

interface ChatPanelProps {
  instanceId: string;
}

const EMPTY_MESSAGES: never[] = [];

export function ChatPanel({ instanceId }: ChatPanelProps) {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.chat.isOpen);
  const messages = useSelector((state: RootState) => state.chat.messagesByInstance[instanceId] || EMPTY_MESSAGES);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const { sendMessage } = useChatSocket(instanceId);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setCenter } = useReactFlow();

  const handleJumpToBubble = (metadata: any) => {
    if (metadata?.x !== undefined && metadata?.y !== undefined) {
      setCenter(metadata.x, metadata.y, { zoom: 1.5, duration: 800 });
    }
  };

  useEffect(() => {
    if (!instanceId) return;

    // Fetch message history on mount
    const fetchHistory = async () => {
      try {
        const res = await gqlRequest(CHAT_HISTORY_QUERY, { instanceId, limit: 100 });
        if (res.chatMessages) {
          // Reversing since array comes latest first or oldest first depending on backend
          // Assuming backend returns newest first for limit, we should sort oldest first for display
          const mapped = res.chatMessages.map((msg: any) => ({
            ...msg,
            metadata: typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata,
          }));
          const sorted = [...mapped].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          dispatch(setMessages({ instanceId, messages: sorted }));
        }
      } catch (err) {
        toast.error('Failed to fetch chat history');
        // console.error('Failed to fetch chat history', err);
      }
    };

    fetchHistory();
  }, [instanceId, dispatch]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-canvas/95 backdrop-blur-md border border-outline1 shadow-lg overflow-hidden animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-outline1 bg-gradient-to-r from-bg to-canvas">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-fg text-sm">Project Chat</h3>
        </div>
        <button 
          onClick={() => dispatch(setChatOpen(false))}
          className="p-1 rounded-md text-secondaryText hover:bg-outline1/50 hover:text-fg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-outline1 font-mono text-sm">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-secondaryText opacity-50 space-y-2">
            <MessageSquare className="w-8 h-8" />
            <p>No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser?.id;
            const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender name for others */}
                {!isMe && (
                  <div className="flex items-center gap-2 mb-1 ml-1">
                    {msg.sender?.avatarUrl ? (
                      <img 
                        src={msg.sender.avatarUrl} 
                        alt={msg.sender.username || 'User'} 
                        className="w-5 h-5 rounded-full ring-1 ring-accent/20"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-outline1/50 flex items-center justify-center text-[10px]">
                        {msg.sender?.username?.[0] || 'U'}
                      </div>
                    )}
                    <span className="text-[10px] text-secondaryText">{msg.sender?.username || msg.senderId.slice(0, 8)}</span>
                  </div>
                )}
                
                <div 
                  onClick={() => msg.type === 'bubble' && handleJumpToBubble(msg.metadata)}
                  className={`relative max-w-[85%] px-3 py-2 rounded-2xl transition-all ${
                    msg.type === 'bubble' ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
                  } ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' 
                      : 'bg-outline1/30 text-fg rounded-tl-sm shadow-sm'
                  } ${msg.type === 'bubble' ? 'border-2 border-accent/50' : ''}`}
                >
                  {msg.type === 'bubble' && (
                    <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-white/20">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Canvas Location</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap word-break tracking-tight">{msg.content}</p>
                </div>
                <span className="text-[9px] text-secondaryText mt-1 opacity-60 px-1">{time}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-canvas border-t border-outline1/50">
        <form onSubmit={handleSend} className="flex relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 py-2 pl-3 pr-10 text-sm bg-outline1/20 border border-outline1/50 rounded-full focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-shadow text-fg placeholder:text-secondaryText font-mono"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-1 top-1 bottom-1 p-1.5 bg-accent hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

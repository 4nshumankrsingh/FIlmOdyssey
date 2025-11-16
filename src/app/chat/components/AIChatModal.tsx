'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageList } from './MessageList';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        content: `Hello${session?.user?.username ? ` ${session.user.username}` : ''}! I'm your FilmOdyssey AI assistant. I can help you discover new films, analyze your taste, or discuss any movie. What would you like to explore?`,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, session?.user?.username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/20 to-amber-900/10 backdrop-blur-md transition-all duration-500"
        style={{
          animation: 'fadeIn 0.5s ease-out'
        }}
      />
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-4xl h-[80vh] max-h-[700px] transform transition-all duration-500 scale-95 opacity-0"
        style={{
          animation: 'modalSlideIn 0.5s ease-out forwards 0.1s'
        }}
      >
        {/* Outer Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-2xl blur-xl -z-10" />
        
        <Card className="w-full h-full border-0 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden relative">
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/30 to-amber-500/30 p-[1px]">
            <div className="absolute inset-0 rounded-2xl bg-black/95 backdrop-blur-xl" />
          </div>

          {/* Header */}
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 border-b border-yellow-400/20 z-10">
            <CardTitle className="text-yellow-400 flex items-center gap-3 text-xl font-bold">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span>FilmOdyssey AI</span>
                <span className="text-sm text-gray-400 font-normal">Your Personal Film Assistant</span>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-yellow-400/10 rounded-full w-9 h-9 p-0 transition-all duration-300 hover:scale-110 border border-gray-700/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </CardHeader>

          {/* Content */}
          <CardContent className="relative flex-1 flex flex-col p-0 overflow-hidden z-10">
            {/* Scrollable Message Area */}
            <div 
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              <MessageList messages={messages} />
              {isLoading && (
                <div className="flex items-center space-x-4 text-yellow-400 bg-yellow-400/10 rounded-2xl p-4 border border-yellow-400/20">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm font-medium">Analyzing your request...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Area */}
            <div className="relative p-6 border-t border-yellow-400/20 bg-gradient-to-t from-black/80 to-transparent flex-shrink-0">
              <div className="flex space-x-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about films, recommendations, or analysis..."
                  className="flex-1 border-yellow-400/40 bg-black/50 text-white placeholder-gray-400 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 h-12"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-300 hover:to-amber-400 rounded-xl px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg h-12 font-semibold disabled:opacity-50 disabled:hover:scale-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
              <p className="text-gray-400 text-xs mt-3 text-center">
                💡 Ask anything about films - no message limits!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(234, 179, 8, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.5);
        }
      `}</style>
    </div>
  );
}

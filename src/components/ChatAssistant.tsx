import React, { useState, useRef, useEffect } from 'react';
import { usePoll } from '../contexts/PollContext';
import { MessageCircle, Send, X, Bot, User, GraduationCap } from 'lucide-react';

interface ChatAssistantProps {
  userType: 'teacher' | 'student';
  userName: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ userType, userName }) => {
  const { chatMessages, sendChatMessage } = usePoll();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message from ChatAssistant:', message.trim(), userName, userType);
      sendChatMessage(message.trim(), userName, userType);
      setMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = (senderType: string) => {
    switch (senderType) {
      case 'ai':
        return <Bot className="w-4 h-4 text-blue-600" />;
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'system':
        return <div className="w-4 h-4 bg-gray-500 rounded-full" />;
      default:
        return <User className="w-4 h-4 text-green-600" />;
    }
  };

  const getMessageBgColor = (senderType: string, sender: string) => {
    if (sender === userName) return 'bg-blue-500 text-white ml-12';
    if (senderType === 'ai') return 'bg-blue-50 border border-blue-200';
    if (senderType === 'system') return 'bg-gray-100 border border-gray-200';
    if (senderType === 'teacher') return 'bg-purple-50 border border-purple-200';
    return 'bg-green-50 border border-green-200';
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {chatMessages.length > 0 && !isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            {chatMessages.length > 99 ? '99+' : chatMessages.length}
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl border z-40 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">AI Chat Assistant</h3>
            </div>
            <p className="text-xs opacity-90">Ask questions or chat with others!</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Hi! I'm your AI assistant.</p>
                <p className="text-xs">Ask me anything about the polling system!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-xs ${getMessageBgColor(msg.senderType, msg.sender)} ${
                    msg.sender === userName ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  {msg.sender !== userName && (
                    <div className="flex items-center space-x-2 mb-1">
                      {getMessageIcon(msg.senderType)}
                      <span className="text-xs font-medium text-gray-600">
                        {msg.sender}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Send, MessageCircle } from 'lucide-react';

const Chat = ({ streamId, user }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket && streamId) {
      // Join stream room
      socket.emit('join-stream', streamId);
      setIsConnected(true);

      // Listen for chat messages
      socket.on('chat-message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      // Listen for donation events
      socket.on('donation', (payload) => {
        setMessages(prev => [
          ...prev,
          {
            id: `donation-${Date.now()}`,
            message: `${payload.donor?.username || 'Ẩn danh'} đã donate ${payload.amount} coin: ${payload.message || ''}`.trim(),
            username: 'SYSTEM',
            timestamp: new Date().toISOString()
          }
        ]);
      });

      // Restore messages from localStorage
      try {
        const saved = localStorage.getItem(`chat-${streamId}`);
        if (saved) setMessages(JSON.parse(saved));
      } catch {}

      return () => {
        socket.emit('leave-stream', streamId);
        socket.off('chat-message');
        socket.off('donation');
      };
    }
  }, [socket, streamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(`chat-${streamId}`, JSON.stringify(messages.slice(-200)));
    } catch {}
  }, [messages, streamId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    const messageData = {
      streamId,
      message: newMessage.trim(),
      username: user.username,
    };

    socket.emit('chat-message', messageData);
    // Hiển thị ngay tin nhắn của chính mình (local echo)
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        message: messageData.message,
        username: messageData.username,
        timestamp: new Date().toISOString()
      }
    ]);
    setNewMessage('');
  };

  if (!isConnected) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-center text-slate-500">
          <MessageCircle className="w-5 h-5 mr-2" />
          <span>Đang kết nối chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col h-96">
      {/* Chat Header */}
      <div className="p-5 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Chat
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2">
              <img
                src={`https://ui-avatars.com/api/?name=${message.username}&background=3b82f6&color=fff`}
                alt={message.username}
                className="w-6 h-6 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-slate-900">
                    {message.username}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mt-1">{message.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-5 border-t border-slate-200">
        <form onSubmit={sendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="input"
          disabled={!user}
        />
          <button
            type="submit"
            disabled={!newMessage.trim() || !user}
            className="btn btn-primary btn-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;




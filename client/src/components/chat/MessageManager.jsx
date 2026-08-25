import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Send, Search, User } from 'lucide-react';

const MessageManager = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
                      import.meta.env.VITE_API_URL?.replace('/api', '') || 
                      (import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:5000');
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    const currentUserId = (user?._id || user?.id)?.toString();
    if (currentUserId) {
      newSocket.emit('join', currentUserId);
    }

    newSocket.on('receiveMessage', (message) => {
      if (selectedUser && String(message.sender) === String(selectedUser.userId)) {
        setMessages((prev) => [...prev, message]);
      }
      fetchConversations();
    });

    return () => newSocket.close();
  }, [user, selectedUser]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.userId);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations/all');
      setConversations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      receiver: selectedUser.userId,
      text: newMessage
    };

    try {
      const res = await api.post('/messages', messageData);
      
      if (socket) {
        socket.emit('sendMessage', res.data.data);
      }
      
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden h-[600px]">
      {/* Sidebar: Conversations List */}
      <div className="border-r border-black/5 flex flex-col h-full">
        <div className="p-6 border-b border-black/5">
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..." 
              className="w-full bg-light pl-10 pr-4 py-2 text-xs rounded-full focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-black/5">
          {filteredConversations.map((conv) => (
            <div 
              key={conv.userId}
              onClick={() => setSelectedUser(conv)}
              className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-light/50 transition-colors ${
                selectedUser?.userId === conv.userId ? 'bg-light' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={18} className="text-primary/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-bold truncate">{conv.userName}</h4>
                  <span className="text-[8px] text-secondary/40">{new Date(conv.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-[10px] text-secondary/60 truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              {!conv.isRead && conv.userId !== user?.id && (
                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className="flex flex-col h-full bg-light/30">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-6 bg-white border-b border-black/5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">{selectedUser.userName}</h4>
                <p className="text-[10px] text-secondary/40 uppercase tracking-widest font-bold">Active Conversation</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-xs ${
                    msg.sender === user?.id 
                      ? 'bg-primary text-on-primary rounded-br-none' 
                      : 'bg-white text-secondary rounded-bl-none border border-black/5'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[8px] opacity-50 block mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-black/5 flex items-center gap-4">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-primary text-xs"
              />
              <button type="submit" className="bg-primary text-on-primary p-2.5 rounded-full hover:bg-primary/90 transition-colors">
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-secondary/30">
            <User size={48} strokeWidth={1} className="opacity-20 mb-4" />
            <p className="text-sm">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageManager;

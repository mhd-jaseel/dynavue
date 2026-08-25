import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Send } from 'lucide-react';

const ChatBox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [adminId, setAdminId] = useState(null);
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
      setMessages((prev) => [...prev, message]);
    });

    return () => newSocket.close();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get('/messages');
        setMessages(res.data.data);
        setAdminId(res.data.otherUserId);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage
    };

    try {
      const res = await api.post('/messages', messageData);
      
      if (socket && adminId) {
        socket.emit('sendMessage', {
          ...res.data.data,
          receiver: adminId
        });
      }
      
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-sm overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-heading">Live Chat</h4>
          <p className="text-[10px] text-secondary/40 uppercase tracking-widest font-bold">Direct line to admin</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-[10px] uppercase tracking-widest text-secondary/40">Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-light/30 dark:bg-black/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-secondary/30">
            <p className="text-sm">No messages yet.</p>
            <p className="text-[10px] uppercase tracking-widest font-bold mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                msg.sender === user?.id 
                  ? 'bg-primary text-on-primary rounded-br-none' 
                  : 'bg-white dark:bg-white/10 text-secondary dark:text-white rounded-bl-none border border-black/5 dark:border-white/5'
              }`}>
                <p>{msg.text}</p>
                <span className="text-[9px] opacity-50 block mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-6 border-t border-black/5 dark:border-white/5 flex items-center gap-4 bg-white dark:bg-transparent">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..." 
          className="flex-1 bg-transparent border-b border-black/10 dark:border-white/10 py-2 focus:outline-none focus:border-primary text-sm"
        />
        <button type="submit" className="bg-primary text-on-primary p-3 rounded-full hover:bg-primary/90 transition-colors">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Clock } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const NotificationManager = ({ onTabChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation(); // Prevent triggering click on the notification item
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification', err);
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete all notifications!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete all',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl max-w-[90%] md:max-w-[400px]',
        title: 'text-2xl font-heading text-primary mb-2',
        htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg mx-2',
        cancelButton: 'bg-transparent border border-black/20 text-secondary px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:border-black transition-all mx-2'
      },
      buttonsStyling: false,
      background: '#ffffff',
      color: '#000000',
    });

    if (result.isConfirmed) {
      try {
        await api.delete('/notifications/delete-all');
        setNotifications([]);
        toast.success('All notifications deleted');
      } catch (err) {
        console.error('Failed to delete all notifications', err);
        toast.error('Failed to delete all notifications');
      }
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    if (notif.type === 'booking_request') {
      if (onTabChange) onTabChange('requests');
    } else if (notif.type === 'message') {
      if (onTabChange) onTabChange('messages');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <h3 className="text-sm uppercase tracking-widest font-bold">Notifications</h3>
        <div className="flex gap-4">
          <button
            onClick={markAllAsRead}
            className="text-[10px] uppercase tracking-widest font-bold text-primary/40 hover:text-primary transition-colors"
          >
            Mark all as read
          </button>
          <button
            onClick={deleteAllNotifications}
            className="text-[10px] uppercase tracking-widest font-bold text-red-500/60 hover:text-red-500 transition-colors"
          >
            Delete all
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Loading Notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-black/5">
            {notifications.map(notif => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-6 hover:bg-light/30 transition-colors cursor-pointer flex items-start gap-4 ${!notif.isRead ? 'bg-primary/5' : ''}`}
              >
                <div className={`p-3 rounded-full ${notif.isRead ? 'bg-light text-secondary/40' : 'bg-primary/10 text-primary'}`}>
                  <Bell size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-sm ${notif.isRead ? 'text-secondary/60' : 'font-bold text-primary'}`}>{notif.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-secondary/40">{new Date(notif.createdAt).toLocaleString()}</span>
                      <button
                        onClick={(e) => deleteNotification(notif._id, e)}
                        className="p-1 text-secondary/30 hover:text-red-500 transition-colors"
                        title="Delete Notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className={`text-xs ${notif.isRead ? 'text-secondary/40' : 'text-secondary'}`}>{notif.message}</p>
                  <p className="text-[10px] text-secondary/30 mt-1">From: {notif.sender?.name || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Bell size={48} className="mx-auto mb-4 text-secondary/20" />
            <h3 className="text-xl font-heading text-primary/40">No notifications</h3>
            <p className="text-[10px] uppercase tracking-widest text-secondary/30 font-bold mt-2">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;

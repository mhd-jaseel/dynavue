import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Camera, Save, Package, Calendar, Clock, Lock, ChevronRight, Star, MessageSquare, ArrowRight, LogOut } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ReviewModal from '../components/reviews/ReviewModal';
import EditBookingModal from '../components/booking/EditBookingModal';
import { requestForToken } from '../lib/firebase';
import Swal from 'sweetalert2';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile';
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const setupNotifications = async () => {
      const token = await requestForToken();
      if (token) {
        try {
          await api.put('/auth/update-fcm-token', { token });
          console.log('FCM Token saved to backend');
        } catch (err) {
          console.error('Failed to save FCM token', err);
        }
      }
    };
    setupNotifications();
  }, []);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePic: user?.profilePic || '',
    servicePreferences: user?.servicePreferences?.join(', ') || ''
  });
  const [myReview, setMyReview] = useState(null);
  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchMyReview = async () => {
    try {
      const res = await api.get('/reviews/my-review');
      setMyReview(res.data.review);
    } catch (err) {
      console.error('Failed to fetch my review', err);
    }
  };
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleEditReview = (review) => {
    setReviewToEdit(review);
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = async () => {
    const result = await Swal.fire({
      title: 'Delete Review?',
      text: 'Are you sure you want to remove your review?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-[#181818] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl max-w-[90%] md:max-w-[400px]',
        title: 'text-2xl font-heading text-white mb-2',
        htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
        confirmButton: 'bg-red-500 text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/5 mx-2',
        cancelButton: 'bg-transparent border border-white/20 text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:border-white transition-all mx-2'
      },
      buttonsStyling: false,
      background: '#181818',
      color: '#ffffff',
    });

    if (result.isConfirmed) {
      try {
        await api.delete('/reviews/my-review');
        setMyReview(null);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your review has been removed.',
          icon: 'success',
          customClass: {
            popup: 'bg-[#181818] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl max-w-[90%] md:max-w-[400px]',
            title: 'text-2xl font-heading text-white mb-2',
            htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
            confirmButton: 'bg-white text-black px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg shadow-white/5'
          },
          buttonsStyling: false,
          background: '#181818',
          color: '#ffffff',
        });
      } catch (err) {
        console.error('Failed to delete review', err);
      }
    }
  };
  const [message, setMessage] = useState('');

  const handleEditBooking = (booking) => {
    setBookingToEdit(booking);
    setIsEditModalOpen(true);
  };

  const handleCancelBooking = async (booking) => {
    const result = await Swal.fire({
      title: 'Cancel Booking?',
      text: 'Are you sure you want to request cancellation for this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Request Cancellation',
      cancelButtonText: 'No, Keep It',
      customClass: {
        popup: 'bg-[#181818] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl max-w-[90%] md:max-w-[400px]',
        title: 'text-2xl font-heading text-white mb-2',
        htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
        actions: 'flex flex-col gap-3 w-full items-center',
        confirmButton: 'bg-red-500 text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/5 w-full max-w-[250px]',
        cancelButton: 'bg-transparent border border-white/20 text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:border-white transition-all w-full max-w-[250px]'
      },
      buttonsStyling: false,
      background: '#181818',
      color: '#ffffff',
    });

    if (result.isConfirmed) {
      try {
        await api.post('/booking-requests', {
          bookingId: booking._id,
          requestType: 'cancel'
        });
        Swal.fire({
          title: 'Request Sent',
          text: 'Your cancellation request has been submitted to admin.',
          icon: 'success',
          customClass: {
            popup: 'bg-[#181818] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl max-w-[90%] md:max-w-[400px]',
            title: 'text-2xl font-heading text-white mb-2',
            htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
            confirmButton: 'bg-white text-black px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg shadow-white/5'
          },
          buttonsStyling: false,
          background: '#181818',
          color: '#ffffff',
        });
        fetchBookings();
      } catch (err) {
        console.error('Failed to cancel booking', err);
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || 'Failed to submit request.',
          icon: 'error',
          customClass: {
            popup: 'bg-[#181818] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl max-w-[90%] md:max-w-[400px]',
            title: 'text-2xl font-heading text-white mb-2',
            htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
            confirmButton: 'bg-white text-black px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg shadow-white/5'
          },
          buttonsStyling: false,
          background: '#181818',
          color: '#ffffff',
        });
      }
    }
  };
  const [bookings, setBookings] = useState([]);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
    if (activeTab === 'feedback') {
      fetchMyReview();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/enquiries/my-enquiries');
      setBookings(res.data.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  const getServiceImage = (serviceType) => {
    const service = services.find(s => s.name === serviceType || s.title === serviceType);
    return service?.image || service?.coverImage;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = {
      ...formData,
      servicePreferences: formData.servicePreferences.split(',').map(s => s.trim()).filter(s => s)
    };
    const success = await updateProfile(data);
    if (success) {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setIsSaving(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      Swal.fire({ title: 'Error', text: 'Passwords do not match', icon: 'error' });
      return;
    }
    Swal.fire({ title: 'Info', text: 'Password change feature integrated (Logic pending backend endpoint)', icon: 'info' });
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] pt-40 pb-24 px-6 md:px-12 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-7xl font-heading tracking-tight text-primary dark:text-white">My Account</h1>
            <div className="flex items-center gap-4">
              <span className="w-12 h-[1px] bg-primary/20 dark:bg-white/10"></span>
              <p className="text-secondary/40 uppercase tracking-[0.4em] text-[10px] font-bold dark:text-white/30">Member since {new Date(user?.createdAt).getFullYear() || '2024'}</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex p-1.5 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full shadow-sm backdrop-blur-xl"
          >
            {[
              { id: 'profile', label: 'Details', icon: User },
              { id: 'bookings', label: 'My Bookings', icon: Package },
              { id: 'feedback', label: 'Feedback', icon: Star },
              { id: 'logout', label: 'Logout', icon: LogOut, action: true }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={async () => {
                  if (tab.action) {
                    const result = await Swal.fire({
                      title: 'Logout?',
                      text: 'Are you sure you want to log out?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: 'Yes, Logout',
                      cancelButtonText: 'Cancel'
                    });
                    if (result.isConfirmed) {
                      logout();
                    }
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-3 px-6 py-3 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-500 relative ${
                  activeTab === tab.id ? 'text-on-primary' : 'text-secondary/50 dark:text-white/30 hover:text-primary dark:hover:text-white'
                }`}
              >
                {activeTab === tab.id && !tab.action && (
                  <motion.div 
                    layoutId="active-profile-tab"
                    className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon size={14} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </motion.div>
        </header>

        <ReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)} 
          userName={user?.name}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-12"
            >
              {/* Profile Card */}
              <aside className="space-y-8">
                <div className="bg-white dark:bg-white/5 p-12 rounded-[3rem] border border-black/5 dark:border-white/10 shadow-sm text-center relative overflow-hidden group backdrop-blur-md">
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary/5 dark:bg-white/5"></div>
                  
                  <div className="relative w-40 h-40 rounded-full bg-light dark:bg-white/5 border border-black/5 dark:border-white/10 overflow-hidden mx-auto mb-10 group/avatar">
                    {formData.profilePic ? (
                      <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/10 dark:text-white/10">
                        <User size={64} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]">
                      <Camera className="text-white mb-2" size={24} />
                      <span className="text-[8px] text-white uppercase tracking-widest font-bold">Change Photo</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-heading text-primary dark:text-white">{user?.name}</h3>
                    <p className="text-[10px] text-secondary/30 uppercase tracking-[0.3em] font-bold dark:text-white/20">Premium {user?.role} Account</p>
                  </div>

                  <div className="mt-12 pt-10 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-heading text-primary dark:text-white">{bookings.length}</p>
                      <p className="text-[8px] uppercase tracking-widest text-secondary/40 font-bold dark:text-white/20">Total Sessions</p>
                    </div>
                    <div className="text-center border-l border-black/5 dark:border-white/5">
                      <p className="text-xl font-heading text-primary dark:text-white">Active</p>
                      <p className="text-[8px] uppercase tracking-widest text-secondary/40 font-bold dark:text-white/20">Status</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary p-10 rounded-[3rem] text-on-primary shadow-xl shadow-primary/10">
                  <h4 className="text-sm uppercase tracking-[0.2em] font-bold mb-4 opacity-80">Need Assistance?</h4>
                  <p className="text-xs font-light leading-relaxed opacity-60 mb-8">Our concierge team is available to help you with your session details and preferences.</p>
                  <Link to="/contact" className="inline-flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold hover:gap-5 transition-all">
                    Contact Studio <ChevronRight size={14} />
                  </Link>
                </div>
              </aside>

              {/* Information Form */}
              <div className="space-y-12">
                <div className="bg-white dark:bg-white/5 p-12 rounded-[3rem] border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="w-10 h-10 rounded-full bg-primary/5 dark:bg-white/5 flex items-center justify-center text-primary/40 dark:text-white/40">
                      <User size={18} />
                    </div>
                    <h4 className="text-2xl font-heading text-primary dark:text-white">Identity & Details</h4>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Full Identity</label>
                        <input 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          className="w-full bg-transparent border-b border-black/5 dark:border-white/10 py-4 focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm font-light placeholder:text-black/10 dark:text-white" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Verified Email</label>
                        <input 
                          name="email" 
                          value={formData.email} 
                          disabled 
                          className="w-full bg-transparent border-b border-black/5 dark:border-white/10 py-4 opacity-30 cursor-not-allowed text-sm font-light dark:text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Contact Number</label>
                        <input 
                          name="phone" 
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone} 
                          onChange={handleChange} 
                          className="w-full bg-transparent border-b border-black/5 dark:border-white/10 py-4 focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm font-light placeholder:text-black/10 dark:text-white" 
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={isSaving} 
                        className="group flex items-center gap-4 bg-primary text-on-primary px-10 py-5 rounded-full uppercase tracking-widest text-[11px] font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                        ) : (
                          <Save size={16} className="group-hover:scale-110 transition-transform" />
                        )}
                        <span>{isSaving ? 'Synchronizing...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white dark:bg-white/5 p-12 rounded-[3rem] border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="w-10 h-10 rounded-full bg-red-500/5 flex items-center justify-center text-red-500/40">
                      <Lock size={18} />
                    </div>
                    <h4 className="text-2xl font-heading text-primary dark:text-white">Security Management</h4>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Current Password</label>
                        <input 
                          type="password" 
                          name="current" 
                          placeholder="••••••••"
                          value={passwordData.current} 
                          onChange={handlePasswordChange} 
                          className="w-full bg-transparent border-b border-black/5 dark:border-white/10 py-4 focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm font-light placeholder:text-black/10 dark:text-white" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">New Security Credential</label>
                        <input 
                          type="password" 
                          name="new" 
                          placeholder="••••••••"
                          value={passwordData.new} 
                          onChange={handlePasswordChange} 
                          className="w-full bg-transparent border-b border-black/5 dark:border-white/10 py-4 focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm font-light placeholder:text-black/10 dark:text-white" 
                        />
                      </div>
                    </div>
                    <button type="submit" className="flex items-center gap-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 px-10 py-5 rounded-full uppercase tracking-widest text-[11px] font-bold hover:bg-light dark:hover:bg-white/10 transition-all text-secondary/60 dark:text-white/40">
                      <Lock size={16} /> Update Password
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'feedback' ? (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white dark:bg-white/5 p-16 rounded-[4rem] border border-black/5 dark:border-white/10 shadow-sm text-center backdrop-blur-md">
                {myReview ? (
                  <div className="text-left max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary/40">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-heading text-primary dark:text-white">{myReview.name}</h4>
                          <div className="flex items-center gap-1 text-yellow-400 text-xs">
                            {[...Array(myReview.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full ${
                        myReview.status === 'approved' ? 'bg-green-50 dark:bg-green-500/10 text-green-500' :
                        myReview.status === 'rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' :
                        'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {myReview.status}
                      </span>
                    </div>
                    <p className="text-secondary/70 dark:text-white/60 font-light italic mb-8">"{myReview.review}"</p>
                    
                    <div className="flex gap-6">
                      <button 
                        onClick={() => handleEditReview(myReview)}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-secondary/40 hover:text-primary transition-colors dark:text-white/40 dark:hover:text-white"
                      >
                        Edit Review
                      </button>
                      <button 
                        onClick={handleDeleteReview}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-500/40 hover:text-red-500 transition-colors"
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-yellow-400/5 rounded-full flex items-center justify-center text-yellow-400 mx-auto mb-10">
                      <Star size={40} fill="currentColor" />
                    </div>
                    <h3 className="text-4xl font-heading text-primary dark:text-white mb-6">Your Voice Matters</h3>
                    <p className="text-secondary/40 text-xs uppercase tracking-[0.2em] font-bold max-w-md mx-auto leading-relaxed mb-12 dark:text-white/20">
                      Help us refine our craft. Share your experience and help others discover the DYNAVUE journey.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                      <button 
                        onClick={() => {
                          setReviewToEdit(null);
                          setIsReviewModalOpen(true);
                        }}
                        className="group flex items-center gap-4 bg-primary text-on-primary px-12 py-5 rounded-full uppercase tracking-widest text-[11px] font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                      >
                        <MessageSquare size={16} className="group-hover:rotate-12 transition-transform" />
                        Write a Review
                      </button>
                    </div>
                  </>
                )}
                
                <div className="mt-20 pt-10 border-t border-black/5 dark:border-white/5">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-secondary/30 font-bold dark:text-white/20">
                    All reviews undergo a standard moderation process before appearing on the public portfolio.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-6"
            >
              {bookings.length > 0 ? (
                bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((booking, idx) => (
                  <motion.div 
                    key={booking._id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-white/5 p-10 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all group backdrop-blur-md"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                        <div className="w-20 h-20 bg-light dark:bg-white/5 rounded-3xl overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
                          {getServiceImage(booking.serviceType) ? (
                            <img 
                              src={getServiceImage(booking.serviceType)} 
                              alt={booking.serviceType} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/10 dark:text-white/10">
                              <Package size={32} strokeWidth={1} />
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xl sm:text-2xl font-heading text-primary dark:text-white">{booking.serviceType}</h4>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] text-secondary/30 uppercase tracking-widest font-bold">
                            <span className="flex items-center gap-2 text-primary/50 dark:text-white/40"><Calendar size={14} className="opacity-40" /> {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center gap-2 dark:text-white/40"><Clock size={14} className="opacity-40" /> Ref: {booking._id.substr(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-2.5 rounded-full border ${
                          booking.status === 'new' ? 'border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-500' :
                          booking.status === 'confirmed' ? 'border-green-500/20 bg-green-50 dark:bg-green-500/10 text-green-500' :
                          booking.status === 'rejected' ? 'border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-500' :
                          'border-black/5 dark:border-white/10 bg-light dark:bg-white/5 text-secondary/40 dark:text-white/20'
                        }`}>
                          {booking.status}
                        </span>
                        <div className="flex items-center gap-4">
                          {(booking.status === 'confirmed' || booking.status === 'new') && (
                            <>
                              <button 
                                onClick={() => handleEditBooking(booking)}
                                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-secondary/40 hover:text-primary transition-colors dark:text-white/40 dark:hover:text-white"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleCancelBooking(booking)}
                                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-500/40 hover:text-red-500 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}
                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary/40 dark:text-white/40 hover:text-primary dark:hover:text-white transition-colors group/btn"
                          >
                            {expandedBookingId === booking._id ? 'Hide' : 'Details'} <ChevronRight size={14} className={`group-hover/btn:translate-x-1 transition-transform ${expandedBookingId === booking._id ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedBookingId === booking._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden border-t border-black/5 dark:border-white/5 pt-6 space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-secondary/70 dark:text-white/60">
                            {booking.eventDate && (
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-widest font-bold text-secondary/40 dark:text-white/30">Event Date</span>
                                <p className="font-light">{new Date(booking.eventDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                            )}
                            {booking.venue && (
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-widest font-bold text-secondary/40 dark:text-white/30">Venue</span>
                                <p className="font-light">{booking.venue}</p>
                              </div>
                            )}
                          </div>
                          {booking.message && (
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-widest font-bold text-secondary/40 dark:text-white/30">Message</span>
                              <p className="font-light italic">"{booking.message}"</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-32 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 backdrop-blur-md">
                  <div className="w-20 h-20 bg-light dark:bg-white/5 rounded-full flex items-center justify-center text-black/5 dark:text-white/5 mx-auto mb-8">
                    <Package size={40} strokeWidth={1} />
                  </div>
                  <h3 className="text-2xl font-heading text-primary dark:text-white mb-4">No Sessions Yet</h3>
                  <p className="text-secondary/40 text-[10px] uppercase tracking-[0.2em] font-bold max-w-xs mx-auto leading-relaxed mb-10 dark:text-white/20">Your personal photography journey is ready to begin.</p>
                  <Link to="/services" className="inline-flex items-center gap-4 bg-primary text-on-primary px-12 py-5 rounded-full text-[11px] uppercase tracking-widest font-bold hover:shadow-2xl shadow-primary/20 transition-all">
                    Explore Our Services <ArrowRight size={16} />
                  </Link>
                </div>
              )}

              {/* Pagination Controls */}
              {bookings.length > itemsPerPage && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                  >
                    Prev
                  </button>
                  {[...Array(Math.ceil(bookings.length / itemsPerPage))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                        currentPage === i + 1
                          ? 'bg-primary text-on-primary'
                          : 'bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-secondary'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bookings.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(bookings.length / itemsPerPage)}
                    className="px-4 py-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <ReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)} 
          userName={user?.name}
          reviewToEdit={reviewToEdit}
          onReviewUpdated={fetchMyReview}
        />

        <EditBookingModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          booking={bookingToEdit}
          services={services}
          onUpdate={fetchBookings}
        />
      </div>
    </div>
  );
};

export default ProfilePage;

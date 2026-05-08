import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Image as ImageIcon, Camera, Calendar, Settings as SettingsIcon, 
  LogOut, Home, ArrowUpRight, Clock, CheckCircle, AlertCircle, Trash2, Eye, LayoutGrid, MessageSquare, Bell
} from 'lucide-react';
import api from '../lib/api';
import Swal from 'sweetalert2';
import NotificationManager from '../components/notifications/NotificationManager';
import AboutPageManager from '../components/about/AboutPageManager';

// Components
import PortfolioController from '../components/admin/PortfolioController';
import ServiceManager from '../components/services/ServiceManager';
import { BookingCalendar, BookingRequestManager } from '../components/booking';
import AdminSettings from '../components/admin/AdminSettings';
import PhotographerManager from '../components/about/PhotographerManager';
import HomeHighlightManager from '../components/home/HomeHighlightManager';
import ReviewManager from '../components/reviews/ReviewManager';
import MessageManager from '../components/chat/MessageManager';

const Admin = () => {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    pendingEnquiries: 0,
    totalPhotos: 0,
    thisMonthBookings: 0
  });
  const [enquiries, setEnquiries] = useState([]);
  const [error, setError] = useState(null);
  const [currentOverviewPage, setCurrentOverviewPage] = useState(1);
  const [currentEnquiriesPage, setCurrentEnquiriesPage] = useState(1);
  const itemsPerOverviewPage = 5;
  const itemsPerEnquiriesPage = 10;

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchEnquiries();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    
    return () => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
      setError(null);
    } catch (err) {
      console.error('Stats fetch error', err);
      if (err.response?.status === 403) {
        setError('Access Denied: You do not have administrator permissions.');
      }
    }
  };
  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries');
      setEnquiries(res.data.data);
    } catch (err) {
      console.error('Enquiries fetch error', err);
    }
  };

  const deleteEnquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await api.delete(`/enquiries/${id}`);
        fetchEnquiries();
        fetchStats();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateEnquiryStatus = async (id, status) => {
    const actionText = status === 'confirmed' ? 'Confirm' : 'Reject';
    const result = await Swal.fire({
      title: `${actionText} Enquiry?`,
      text: `Are you sure you want to ${actionText.toLowerCase()} this enquiry?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl max-w-[90%] md:max-w-[400px]',
        title: 'text-2xl font-heading text-primary mb-2',
        htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
        actions: 'flex flex-col gap-4 w-full items-center',
        confirmButton: `${status === 'confirmed' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'} text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg w-full max-w-[250px]`,
        cancelButton: 'bg-transparent border border-black/20 text-secondary px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:border-black transition-all w-full max-w-[250px]'
      },
      buttonsStyling: false,
      background: '#ffffff',
      color: '#000000',
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/enquiries/${id}`, { status });
        Swal.fire({
          title: 'Success!',
          text: `Enquiry ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully.`,
          icon: 'success',
          customClass: {
            popup: 'bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl max-w-[90%] md:max-w-[400px]',
            title: 'text-2xl font-heading text-primary mb-2',
            htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
            confirmButton: 'bg-primary text-on-primary px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg'
          },
          buttonsStyling: false,
          background: '#ffffff',
          color: '#000000',
        });
        fetchEnquiries();
        fetchStats();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: 'Error',
          text: 'Failed to update status.',
          icon: 'error',
          customClass: {
            popup: 'bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl max-w-[90%] md:max-w-[400px]',
            title: 'text-2xl font-heading text-primary mb-2',
            htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
            confirmButton: 'bg-primary text-on-primary px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg'
          },
          buttonsStyling: false,
          background: '#ffffff',
          color: '#000000',
        });
      }
    }
  };
  const viewEnquiryDetails = (enq) => {
    Swal.fire({
      title: 'Enquiry Details',
      html: `
        <div class="text-left space-y-4 text-sm text-secondary">
          <p><span class="font-bold">Client:</span> ${enq.name}</p>
          <p><span class="font-bold">Email:</span> ${enq.email}</p>
          <p><span class="font-bold">Phone:</span> ${enq.phone || 'N/A'}</p>
          <p><span class="font-bold">Service:</span> ${enq.serviceType}</p>
          <p><span class="font-bold">Date:</span> ${enq.eventDate ? new Date(enq.eventDate).toLocaleDateString() : 'N/A'}</p>
          <p><span class="font-bold">Time:</span> ${enq.time || 'N/A'}</p>
          <p><span class="font-bold">Message:</span> ${enq.message || 'No message provided.'}</p>
        </div>
      `,
      customClass: {
        popup: 'bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl max-w-[90%] md:max-w-[500px]',
        title: 'text-2xl font-heading text-primary mb-6',
        confirmButton: 'bg-primary text-on-primary px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/5'
      },
      buttonsStyling: false,
      background: '#ffffff',
      color: '#000000',
    });
  };

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications?limit=100');
      const notifications = res.data.data || [];
      const unread = notifications.filter(n => !n.isRead).length;
      setUnreadNotifications(unread);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'enquiries', label: 'Enquiries', icon: Users },
    { id: 'requests', label: 'Requests', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
    { id: 'home', label: 'Home Page', icon: LayoutGrid },
    { id: 'about', label: 'About Page', icon: LayoutGrid },
    { id: 'services', label: 'Services', icon: Camera },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-black/5 z-[70] flex flex-col pt-20
        transition-transform duration-500 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-6 py-8 flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary/30 font-bold mb-8">Admin Hub</h2>
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.2em] transition-all duration-500 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/10 rounded-lg' 
                    : 'text-secondary/60 hover:text-primary hover:bg-black/5 rounded-lg'
                }`}
              >
                <tab.icon size={16} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-black/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">{user?.name}</p>
              <p className="text-[9px] text-secondary/40">Administrator</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              const result = await Swal.fire({
                title: 'Logout?',
                text: 'Are you sure you want to log out of the Admin panel?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Logout',
                cancelButtonText: 'Cancel'
              });
              if (result.isConfirmed) {
                logout();
              }
            }} 
            className="w-full flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header Toggle */}
      <div className="fixed top-0 left-0 right-0 h-20 flex items-center px-6 bg-[#F8F7F4]/80 backdrop-blur-md z-50 lg:hidden border-b border-black/5">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-primary">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="2" rx="1" fill="currentColor"/>
            <rect y="6" width="14" height="2" rx="1" fill="currentColor"/>
            <rect y="12" width="20" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <span className="ml-4 font-heading text-lg">DYNAVUE Dashboard</span>
      </div>

      {/* Main Content */}
      <main className="flex-grow lg:pl-64 pt-20">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          
          {error ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl font-heading mb-3">Permission Denied</h2>
              <p className="text-secondary/60 text-sm max-w-sm mb-8">{error}</p>
              <button onClick={logout} className="bg-primary text-on-primary px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold">
                Switch Account
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-8 lg:pt-0">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading capitalize mb-2">{activeTab}</h1>
              <p className="text-secondary/50 text-[10px] uppercase tracking-[0.3em]">DYNAVUE Management Dashboard</p>
            </div>
            <Link to="/" className="group flex items-center gap-2 text-[10px] uppercase tracking-widest border-b border-black/10 pb-1 hover:border-primary transition-all">
              View Public Site <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: Users, color: 'bg-blue-500' },
                    { label: 'Pending Response', value: stats.pendingEnquiries, icon: Clock, color: 'bg-yellow-500' },
                    { label: 'Total Photos', value: stats.totalPhotos, icon: ImageIcon, color: 'bg-purple-500' },
                    { label: 'Month Bookings', value: stats.thisMonthBookings, icon: CheckCircle, color: 'bg-green-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${stat.color}/10 text-${stat.color.split('-')[1]}-600`}>
                          <stat.icon size={20} />
                        </div>
                        <span className="text-[10px] text-green-500 font-bold">+12%</span>
                      </div>
                      <h4 className="text-3xl font-heading mb-1">{stat.value}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity / Quick Enquiries */}
                <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center">
                    <h3 className="text-sm uppercase tracking-widest font-bold">Recent Enquiries</h3>
                    <button onClick={() => setActiveTab('enquiries')} className="text-[10px] uppercase tracking-widest text-primary font-bold">View All</button>
                  </div>
                  <div className="divide-y divide-black/5">
                    {enquiries.slice((currentOverviewPage - 1) * itemsPerOverviewPage, currentOverviewPage * itemsPerOverviewPage).map(enq => (
                      <div key={enq._id} className="px-8 py-4 flex items-center justify-between hover:bg-light/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center font-bold text-xs">
                            {enq.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{enq.name}</p>
                            <p className="text-[10px] text-secondary/40">{enq.serviceType} • {new Date(enq.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold ${
                            enq.status === 'new' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                          }`}>
                            {enq.status}
                          </span>
                          <button onClick={() => setActiveTab('enquiries')} className="p-2 text-secondary/30 hover:text-primary transition-colors">
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {enquiries.length > itemsPerOverviewPage && (
                    <div className="px-8 py-4 border-t border-black/5 flex justify-between items-center text-xs">
                      <span className="text-secondary/40 font-bold uppercase tracking-widest">Page {currentOverviewPage} of {Math.ceil(enquiries.length / itemsPerOverviewPage)}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentOverviewPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentOverviewPage === 1}
                          className="px-3 py-1 bg-light rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-30"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setCurrentOverviewPage(prev => Math.min(prev + 1, Math.ceil(enquiries.length / itemsPerOverviewPage)))}
                          disabled={currentOverviewPage === Math.ceil(enquiries.length / itemsPerOverviewPage)}
                          className="px-3 py-1 bg-light rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-30"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'enquiries' && (
              <motion.div key="enquiries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 text-[10px] uppercase tracking-[0.2em] text-secondary/40">
                        <th className="px-8 py-6 font-bold">Date</th>
                        <th className="px-8 py-6 font-bold">Client</th>
                        <th className="px-8 py-6 font-bold">Service</th>
                        <th className="px-8 py-6 font-bold">Status</th>
                        <th className="px-8 py-6 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {enquiries.slice((currentEnquiriesPage - 1) * itemsPerEnquiriesPage, currentEnquiriesPage * itemsPerEnquiriesPage).map(enq => (
                        <tr key={enq._id} className="hover:bg-light/30 transition-colors group">
                          <td className="px-8 py-5 text-xs font-light">{new Date(enq.createdAt).toLocaleDateString()}</td>
                          <td className="px-8 py-5">
                            <p className="text-xs font-bold">{enq.name}</p>
                            <p className="text-[10px] text-secondary/40">{enq.email}</p>
                          </td>
                          <td className="px-8 py-5 text-[11px] font-light text-secondary uppercase tracking-widest">{enq.serviceType}</td>
                          <td className="px-8 py-5">
                            <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold ${
                              enq.status === 'new' ? 'bg-yellow-50 text-yellow-600' :
                              enq.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                              enq.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-light text-secondary/60'
                            }`}>
                              {enq.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right space-x-2">
                            <button onClick={() => viewEnquiryDetails(enq)} className="p-2 text-secondary/30 hover:text-primary transition-colors" title="View Details"><Eye size={16} /></button>
                            {enq.status !== 'confirmed' && (
                              <button onClick={() => updateEnquiryStatus(enq._id, 'confirmed')} className="p-2 text-secondary/30 hover:text-green-600 transition-colors" title="Confirm Booking"><CheckCircle size={16} /></button>
                            )}
                            {enq.status !== 'rejected' && (
                              <button onClick={() => updateEnquiryStatus(enq._id, 'rejected')} className="p-2 text-secondary/30 hover:text-red-600 transition-colors" title="Reject Booking"><AlertCircle size={16} /></button>
                            )}
                            <button onClick={() => deleteEnquiry(enq._id)} className="p-2 text-secondary/30 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {enquiries.length > itemsPerEnquiriesPage && (
                  <div className="px-8 py-4 border-t border-black/5 flex justify-between items-center text-xs">
                    <span className="text-secondary/40 font-bold uppercase tracking-widest">Page {currentEnquiriesPage} of {Math.ceil(enquiries.length / itemsPerEnquiriesPage)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentEnquiriesPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentEnquiriesPage === 1}
                        className="px-3 py-1 bg-light rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-30"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setCurrentEnquiriesPage(prev => Math.min(prev + 1, Math.ceil(enquiries.length / itemsPerEnquiriesPage)))}
                        disabled={currentEnquiriesPage === Math.ceil(enquiries.length / itemsPerEnquiriesPage)}
                        className="px-3 py-1 bg-light rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'portfolio' && <PortfolioController key="portfolio" />}
            { activeTab === 'home' && <HomeHighlightManager key="home" /> }
            { activeTab === 'about' && <AboutPageManager key="about" /> }
            { activeTab === 'services' && <ServiceManager key="services" /> }
             { activeTab === 'reviews' && <ReviewManager key="reviews" /> }
            { activeTab === 'requests' && <BookingRequestManager key="requests" /> }
            { activeTab === 'notifications' && <NotificationManager key="notifications" onTabChange={setActiveTab} /> }
            { activeTab === 'messages' && <MessageManager key="messages" /> }
            { activeTab === 'team' && <PhotographerManager key="team" /> }
            { activeTab === 'calendar' && <BookingCalendar key="calendar" /> }
            { activeTab === 'settings' && <AdminSettings key="settings" /> }

          </AnimatePresence>
        </>
      )}
    </div>
  </main>
</div>
  );
};

export default Admin;

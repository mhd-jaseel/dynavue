import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Camera, User, ArrowRight } from 'lucide-react';

const BookingSuccess = () => {
  const location = useLocation();
  const bookingData = location.state?.booking;

  if (!bookingData) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#0A0A0A] flex items-center justify-center px-6 py-20 transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white dark:bg-white/5 p-10 md:p-16 rounded-[3rem] border border-black/5 dark:border-white/10 shadow-sm text-center backdrop-blur-md"
      >
        <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-4xl font-heading text-neutral-900 dark:text-white mb-4">Booking Confirmed</h1>
        <p className="text-neutral-500 dark:text-white/30 text-[11px] uppercase tracking-[0.3em] font-bold mb-12">Thank you for choosing DYNAVUE</p>

        <div className="space-y-6 text-left mb-12 bg-neutral-50 dark:bg-white/5 p-8 rounded-3xl border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-3 text-neutral-500 dark:text-white/40 uppercase tracking-widest text-[9px] font-bold">
              <Camera size={14} /> Service
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-white">{bookingData.serviceName}</span>
          </div>
          
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-3 text-neutral-500 dark:text-white/40 uppercase tracking-widest text-[9px] font-bold">
              <User size={14} /> Client
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-white">{bookingData.userName}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-neutral-500 dark:text-white/40 uppercase tracking-widest text-[9px] font-bold">
              <Calendar size={14} /> Date & Time
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-white">{new Date(bookingData.date).toLocaleDateString()} at {bookingData.time}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/profile?tab=bookings" 
            className="w-full sm:w-auto px-10 bg-primary text-on-primary py-4 rounded-full uppercase tracking-widest text-[11px] font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-center"
          >
            View Booking
          </Link>
          <Link 
            to="/" 
            className="w-full sm:w-auto px-10 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 py-4 rounded-full uppercase tracking-widest text-[11px] font-bold hover:bg-light dark:hover:bg-white/10 transition-all text-secondary dark:text-white/60 text-center"
          >
            Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import Swal from 'sweetalert2';

const EditBookingModal = ({ isOpen, onClose, booking, services, onUpdate }) => {
  const [formData, setFormData] = useState({
    eventDate: '',
    serviceType: '',
    venue: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        eventDate: booking.eventDate ? new Date(booking.eventDate).toISOString().split('T')[0] : '',
        serviceType: booking.serviceType || '',
        venue: booking.venue || '',
        message: booking.message || ''
      });
    }
  }, [booking, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/booking-requests', {
        bookingId: booking._id,
        requestType: 'edit',
        updatedData: formData
      });
      setIsSuccess(true);
      if (onUpdate) onUpdate();
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit edit request', err);
      Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Failed to submit request.', icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-[#121212] rounded-[3rem] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="absolute right-8 top-8">
              <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-secondary dark:text-white/40">
                <X size={20} />
              </button>
            </div>

            <div className="p-12">
              {!isSuccess ? (
                <>
                  <div className="mb-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary/40 dark:text-white/30 font-bold mb-3">Modify Your Booking</p>
                    <h2 className="text-4xl font-heading text-primary dark:text-white">Edit Request</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Service</label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full bg-transparent border border-black/5 dark:border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm dark:text-white"
                      >
                        {services.map(s => (
                          <option key={s._id} value={s.name || s.title} className="dark:bg-[#121212]">{s.name || s.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Event Date</label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full bg-transparent border border-black/5 dark:border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Venue / Location</label>
                      <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="w-full bg-transparent border border-black/5 dark:border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Notes / Details</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-transparent border border-black/5 dark:border-white/10 rounded-2xl p-4 min-h-[100px] focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full group flex items-center justify-center gap-4 bg-primary text-on-primary px-10 py-4 rounded-full uppercase tracking-widest text-[11px] font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                      ) : (
                        <>Submit Request <Send size={16} /></>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-8"
                  >
                    <CheckCircle size={40} />
                  </motion.div>
                  <h3 className="text-3xl font-heading text-primary dark:text-white mb-4">Request Sent!</h3>
                  <p className="text-secondary/40 text-[10px] uppercase tracking-[0.2em] font-bold max-w-xs leading-relaxed dark:text-white/20">Your edit request has been submitted and is awaiting admin approval.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditBookingModal;

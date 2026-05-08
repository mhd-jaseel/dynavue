import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createEnquiry } from '../../services/bookingService';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Must be a 10-digit number').required('Phone is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  serviceType: yup.string().required('Please select a service'),
  eventDate: yup.date()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .min(new Date(), 'Date must be in the future')
    .required('Event date is required'),
  time: yup.string().required('Time is required'),
  venue: yup.string(),
  message: yup.string(),
});

const BookingForm = ({ defaultService = '' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      serviceType: defaultService,
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const selectedService = watch('serviceType');

  const onSubmit = async (data) => {
    if (!isAuthenticated) return;
    
    const result = await Swal.fire({
      title: 'Confirm Your Journey',
      text: 'Are you sure you want to submit your booking inquiry?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-[#181818] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl max-w-[90%] md:max-w-[400px]',
        title: 'text-2xl font-heading text-white mb-2',
        htmlContainer: 'text-sm font-light text-secondary/70 mb-8',
        confirmButton: 'bg-white text-black px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg shadow-white/5 mx-2',
        cancelButton: 'bg-transparent border border-white/20 text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:border-white transition-all mx-2'
      },
      buttonsStyling: false,
      background: '#181818',
      color: '#ffffff',
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        const res = await createEnquiry(data);
        
        // Show success alert
        await Swal.fire({
          title: 'Journey Submitted',
          text: 'Your inquiry has been successfully sent. We’ll connect with you soon.',
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

        // Redirect to success page with data
        navigate('/booking-success', { 
          state: { 
            booking: {
              id: res.data.data?._id || 'pending',
              serviceName: data.serviceType,
              userName: data.name,
              date: data.eventDate,
              time: data.time
            } 
          } 
        });
      } catch (err) {
        console.error('Error submitting form', err);
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
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
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-light/50 h-full text-center rounded-[2rem] border border-dashed border-black/10">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
          <Lock size={24} className="text-primary/20" strokeWidth={1.5} />
        </div>
        <h3 className="font-heading text-2xl mb-4">Authentication Required</h3>
        <p className="text-secondary/50 text-xs uppercase tracking-widest font-bold mb-8">Please log in to continue with your booking</p>
        <Link 
          to={`/login?redirect=${location.pathname}${location.search}`}
          className="bg-primary text-on-primary px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Login to Continue
        </Link>
        <p className="mt-6 text-[10px] uppercase tracking-widest text-secondary/40">
          Don't have an account? <Link to="/signup" className="text-primary font-bold">Sign Up</Link>
        </p>
      </div>
    );
  }

  const labelClass = "block text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40 mb-2";
  const inputClass = "w-full bg-transparent border-b-[1.5px] border-black/40 dark:border-white/30 py-4 focus:outline-none focus:border-black dark:focus:border-white transition-all duration-500 text-primary placeholder:text-secondary/30 font-light rounded-none text-base";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className={labelClass}>Full Name</label>
          <input {...register('name')} placeholder="e.g. Elena Gilbert" className={inputClass} />
          {errors.name && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-2">{errors.name.message}</p>}
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className={labelClass}>Phone Number</label>
          <input {...register('phone')} placeholder="e.g. 9876543210" className={inputClass} type="tel" />
          {errors.phone && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-2">{errors.phone.message}</p>}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <label className={labelClass}>Email Address</label>
        <input {...register('email')} placeholder="e.g. hello@example.com" className={inputClass} type="email" />
        {errors.email && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-2">{errors.email.message}</p>}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative z-50">
          <label className={labelClass}>Service Type</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${inputClass} flex justify-between items-center pr-4 text-left`}
            >
              <span className={selectedService ? 'text-primary' : 'text-secondary/30'}>
                {selectedService ? 
                  [
                    { value: 'Wedding', label: 'Wedding Photography' },
                    { value: 'Engagement', label: 'Engagement Session' },
                    { value: 'Portrait', label: 'Editorial Portraits' },
                    { value: 'Events', label: 'Events & Celebrations' },
                    { value: 'Candid', label: 'Candid & Lifestyle' }
                  ].find(o => o.value === selectedService)?.label || selectedService
                  : 'Select a Service'}
              </span>
              <ArrowRight size={16} className={`text-primary/30 transition-transform duration-300 ${isDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-50 mt-2 w-full bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
                >
                  {[
                    { value: 'Wedding', label: 'Wedding Photography' },
                    { value: 'Engagement', label: 'Engagement Session' },
                    { value: 'Portrait', label: 'Editorial Portraits' },
                    { value: 'Events', label: 'Events & Celebrations' },
                    { value: 'Candid', label: 'Candid & Lifestyle' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setValue('serviceType', option.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-6 py-4 text-sm font-light hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors flex items-center justify-between group"
                    >
                      <span className={selectedService === option.value ? 'text-primary font-medium' : 'text-secondary'}>
                        {option.label}
                      </span>
                      {selectedService === option.value && (
                        <CheckCircle size={14} className="text-primary" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Hidden input for react-hook-form */}
            <input type="hidden" {...register('serviceType')} />
          </div>
          {errors.serviceType && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-2">{errors.serviceType.message}</p>}
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <label className={labelClass}>Event Date</label>
          <input {...register('eventDate')} type="date" className={inputClass} />
          {errors.eventDate && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-2">{errors.eventDate.message}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <label className={labelClass}>Event Time</label>
          <input {...register('time')} type="time" className={inputClass} />
          {errors.time && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-2">{errors.time.message}</p>}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <label className={labelClass}>Venue / Location</label>
        <input {...register('venue')} placeholder="Where is the magic happening?" className={inputClass} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <label className={labelClass}>Your Story</label>
        <textarea {...register('message')} placeholder="Tell us about your vision, the details, and what matters most to you..." rows="3" className={`${inputClass} resize-none`} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="pt-6">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="group flex items-center gap-4 text-primary tracking-[0.3em] uppercase text-[11px] font-bold hover:gap-8 transition-all duration-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Submit Journey'}
          <ArrowRight size={20} className="text-primary/40 group-hover:text-primary transition-colors" />
        </button>
      </motion.div>
    </form>
  );
};

export default BookingForm;

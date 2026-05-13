import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, MapPin, Instagram, MessageCircle, ArrowRight, User, MessageSquare } from 'lucide-react';
import BookingForm from '../components/booking/BookingForm';
import ChatBox from '../components/chat/ChatBox';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('booking');
  const { user } = useAuth();
  const serviceParam = searchParams.get('service');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 md:pt-48 pb-24 px-6 md:px-12 transition-colors duration-500 bg-base min-h-screen"
    >
      <Helmet>
        <title>Contact Us | DYNAVUE Wedding Photography Kerala</title>
        <meta name="description" content="Get in touch with DYNAVUE for booking inquiries, collaborations, and live chat. Let's tell your story." />
        <meta name="keywords" content="contact DYNAVUE, book photographer Kerala, wedding photography inquiry, live chat support" />
        <link rel="canonical" href="https://dynavue.in/contact" />
        <meta property="og:title" content="Contact Us | DYNAVUE Wedding Photography Kerala" />
        <meta property="og:description" content="Get in touch with DYNAVUE for booking inquiries, collaborations, and live chat." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dynavue.in/contact" />
      </Helmet>
      <div className="max-w-7xl mx-auto">

        {/* Header: Centered and Elegant */}
        <header className="text-center mb-24 md:mb-32">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] text-primary/40 mb-6 font-semibold"
          >
            Connect With Us
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-8xl font-heading leading-tight mb-8"
          >
            Let&apos;s tell your <span className="italic font-light">story.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-secondary/50 tracking-[0.3em] uppercase text-[10px] md:text-xs"
          >
            Available for worldwide commissions & collaborations
          </motion.p>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-light/50 dark:bg-white/5 p-1.5 rounded-full border border-black/5 dark:border-white/10 backdrop-blur-md flex items-center gap-2">
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'booking'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-secondary/60 hover:text-primary'
              }`}
            >
              <User size={14} />
              Book Our Service
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'chat'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-secondary/60 hover:text-primary'
              }`}
            >
              <MessageSquare size={14} />
              Live Chat
            </button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'booking' ? (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-primary/[0.01] border border-black/35 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:border-white/20 dark:shadow-none p-12 md:p-16 rounded-[2.5rem]"
              >
                <div className="mb-12">
                  <h4 className="text-2xl font-heading mb-2">Project Brief</h4>
                  <p className="text-secondary/50 text-sm font-light">Tell us a little about your vision and what you&apos;re looking for.</p>
                </div>
                <BookingForm defaultService={serviceParam || ''} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              {user ? (
                <ChatBox />
              ) : (
                <div className="text-center p-12 bg-white dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-sm">
                  <MessageSquare size={48} className="mx-auto mb-4 text-secondary/20" />
                  <h4 className="text-lg font-bold mb-1">Login Required</h4>
                  <p className="text-xs text-secondary/50 mb-6">You must be logged in to message the admin.</p>
                  <Link to="/login" className="inline-block bg-primary text-on-primary px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors">
                    Login Now
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Detail: Subtle and Professional */}
        <footer className="mt-32 pt-16 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500/40 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/40 font-medium">Currently accepting bookings for 2025</p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/30">
            © 2024 DYNAVUE Studio. All Rights Reserved.
          </p>
        </footer>

      </div>
    </motion.div>
  );
};

export default Contact;

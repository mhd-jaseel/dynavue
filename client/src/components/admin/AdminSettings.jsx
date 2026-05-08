import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Globe, Bell, Save } from 'lucide-react';

const AdminSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState('general');

  const subTabs = [
    { id: 'general', label: 'App Settings', icon: Globe },
    { id: 'email', label: 'Email / SMTP', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
      {/* Sub Navigation */}
      <div className="space-y-2">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 rounded-2xl ${
              activeSubTab === tab.id 
                ? 'bg-white shadow-sm border border-black/5 text-primary' 
                : 'text-secondary/40 hover:text-primary hover:bg-white/50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-10 md:p-12">
        {activeSubTab === 'general' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <header className="mb-10">
              <h4 className="text-2xl font-heading mb-2">General Configuration</h4>
              <p className="text-secondary/50 text-[10px] uppercase tracking-widest font-bold">App identity and branding</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30">App Name</label>
                <input className="w-full bg-light/50 border-b border-black/5 py-3 focus:outline-none focus:border-primary transition-colors text-sm" defaultValue="DYNAVUE Photography" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30">Tagline</label>
                <input className="w-full bg-light/50 border-b border-black/5 py-3 focus:outline-none focus:border-primary transition-colors text-sm" defaultValue="Every Frame. Every Feeling." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30">Business Description</label>
              <textarea rows="4" className="w-full bg-light/50 border-b border-black/5 py-3 focus:outline-none focus:border-primary transition-colors text-sm resize-none" defaultValue="Premium photography studio specializing in weddings, portraits, and editorial content." />
            </div>

            <div className="pt-8">
              <button className="flex items-center gap-3 bg-primary text-on-primary px-10 py-4 uppercase tracking-widest text-[11px] font-bold hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/20">
                <Save size={14} /> Save Configuration
              </button>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'email' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             <h4 className="text-2xl font-heading mb-6">SMTP Settings</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30">SMTP Server</label>
                  <input className="w-full bg-light/50 border-b border-black/5 py-3 text-sm" defaultValue="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30">SMTP Port</label>
                  <input className="w-full bg-light/50 border-b border-black/5 py-3 text-sm" defaultValue="587" />
                </div>
             </div>
             <p className="text-[9px] text-yellow-600 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
               Note: For Gmail, use an App Password for secure authentication.
             </p>
          </motion.div>
        )}


      </div>
    </div>
  );
};

export default AdminSettings;

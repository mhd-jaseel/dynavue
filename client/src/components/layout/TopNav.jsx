import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import Swal from 'sweetalert2';

const TopNav = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="hidden md:flex fixed top-0 left-0 w-full z-50 justify-center px-6 pointer-events-none pt-6">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto w-full max-w-[1400px]"
      >
        <div className="flex items-center justify-between w-full rounded-full p-1.5 pl-8 bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500">

          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-crake tracking-widest text-primary hover:opacity-80 transition-opacity">
            DYNAVUE
          </Link>

          {/* Right Side: Links and Toggle */}
          <div className="flex items-center">
            {/* Navigation Links */}
            <nav className="flex items-center px-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className="relative px-5 py-2.5 rounded-full text-[10px] md:text-[11px] tracking-[0.15em] uppercase font-bold transition-colors duration-300 group"
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="topnav-active-pill"
                        className="absolute inset-0 bg-primary rounded-full shadow-[0_2px_14px_rgba(0,0,0,0.18)] dark:shadow-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {/* Hover effect when not active */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-full bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}

                    <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-on-primary' : 'text-primary/60 group-hover:text-primary'}`}>
                      {link.name}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Auth / Profile & Theme Toggle */}
            <div className="flex items-center ml-2 border-l border-primary/10 pl-5 h-5 gap-6">
              
              {/* User Profile / Login */}
              <div className="relative pointer-events-auto">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 text-primary/60 hover:text-primary hover:bg-primary/10 transition-all duration-300 group"
                    >
                      <User size={16} className="transition-transform group-hover:scale-110" />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <>
                          <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-12 right-0 w-48 bg-white dark:bg-black/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[60]"
                          >
                            <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 mb-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest truncate">{user?.name}</p>
                              <p className="text-[8px] text-secondary/40 truncate">{user?.email}</p>
                            </div>
                            
                            {user?.role === 'admin' && (
                              <Link 
                                to="/admin" 
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-secondary/60 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
                              >
                                <Settings size={14} /> Dashboard
                              </Link>
                            )}
                            
                            <Link 
                              to="/profile" 
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-secondary/60 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                              <User size={14} /> My Profile
                            </Link>
                            
                            <button 
                              onClick={async () => {
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
                                  setIsProfileOpen(false);
                                }
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-red-500/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all mt-1"
                            >
                              <LogOut size={14} /> Logout
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 text-primary/60 hover:text-primary hover:bg-primary/10 transition-all duration-300 group"
                  >
                    <LogIn size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>
    </div>
  );
};

export default TopNav;

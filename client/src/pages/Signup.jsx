import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/common/GoogleLoginButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Signup = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register: signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  // SEO: Update page title and description
  useEffect(() => {
    document.title = "Join DYNAVUE | Luxury Photography Portfolio";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Create your DYNAVUE account to book exclusive photography sessions and manage your luxury portfolio experience.");
    }
  }, []);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const success = await signup(data.name, data.email, data.password);
    
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError('Registration failed. Email might already be in use.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-6 py-20">
      <div className="max-w-md w-full">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-heading mb-3 tracking-tight text-primary"
          >
            Create Account
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] uppercase tracking-[0.4em] text-secondary/40 dark:text-secondary/60 font-bold"
          >
            Join the DYNAVUE Collective
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#181818]/90 dark:backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative"
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="signup-form"
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-8"
              >
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 text-[10px] uppercase tracking-widest font-bold text-center rounded-2xl border border-red-100 dark:border-red-900/20">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-secondary dark:text-secondary/70">Full Name</label>
                    <div className="relative">
                      <input
                        {...register('name')}
                        type="text"
                        placeholder="Elena Gilbert"
                        className="w-full bg-transparent border-b border-black/5 dark:border-white/20 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-light pr-10 text-primary placeholder:text-secondary/30 dark:placeholder:text-white/10"
                        disabled={isLoading}
                      />
                      <User size={14} className="absolute right-0 top-4 text-primary/20" />
                    </div>
                    {errors.name && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-secondary dark:text-secondary/70">Email Address</label>
                    <div className="relative">
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="hello@example.com"
                        className="w-full bg-transparent border-b border-black/5 dark:border-white/20 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-light pr-10 text-primary placeholder:text-secondary/30 dark:placeholder:text-white/10"
                        disabled={isLoading}
                      />
                      <Mail size={14} className="absolute right-0 top-4 text-primary/20" />
                    </div>
                    {errors.email && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-secondary dark:text-secondary/70">Password</label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-transparent border-b border-black/5 dark:border-white/20 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-light pr-10 text-primary placeholder:text-secondary/30 dark:placeholder:text-white/10"
                        disabled={isLoading}
                      />
                      <Lock size={14} className="absolute right-0 top-4 text-primary/20" />
                    </div>
                    {errors.password && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-1">{errors.password.message}</p>}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary text-on-primary py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>Create Account <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center text-green-500 dark:text-green-400 mx-auto mb-6">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-heading mb-2 text-primary">Welcome to DYNAVUE</h2>
                <p className="text-secondary/50 dark:text-secondary/70 text-xs uppercase tracking-widest font-bold">Your journey begins now...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSuccess && (
            <>
              <div className="my-8 flex items-center gap-4">
                <div className="flex-grow h-px bg-black/5 dark:bg-white/5"></div>
                <span className="text-[9px] uppercase tracking-widest text-secondary/40 font-bold">OR</span>
                <div className="flex-grow h-px bg-black/5 dark:bg-white/5"></div>
              </div>

              <GoogleLoginButton text="Sign up with Google" />
            </>
          )}
        </motion.div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-secondary/40 dark:text-secondary/60">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline decoration-primary/30">Sign in</Link>
          </p>
          <div>
            <Link to="/" className="text-[10px] uppercase tracking-widest text-secondary/40 dark:text-secondary/60 hover:text-primary transition-colors">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

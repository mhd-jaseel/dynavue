import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useSearchParams, useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/common/GoogleLoginButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  if (isAuthenticated && user) {
    const redirectParam = searchParams.get('redirect');
    const defaultRedirect = user.role === 'admin' ? '/admin' : '/';
    const finalRedirect = redirectParam || defaultRedirect;
    return <Navigate to={finalRedirect} replace />;
  }

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (success) {
      toast.success('Login successful!');
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading mb-3 tracking-tight text-primary">DYNAVUE</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-secondary/40 dark:text-secondary/60 font-bold">Access Portal</p>
        </div>

        <div className="bg-white dark:bg-[#181818]/90 dark:backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-heading mb-8 text-center text-primary">Login to your account</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary dark:text-secondary/70">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="hello@example.com"
                autoComplete="email"
                className="w-full bg-transparent border-b border-black/5 dark:border-white/20 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-light text-primary placeholder:text-secondary/30 dark:placeholder:text-white/10"
              />
              {errors.email && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary dark:text-secondary/70">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-transparent border-b border-black/5 dark:border-white/20 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-light text-primary placeholder:text-secondary/30 dark:placeholder:text-white/10"
              />
              {errors.password && <p className="text-red-500/60 text-[10px] uppercase tracking-wider mt-1">{errors.password.message}</p>}
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-primary text-on-primary py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/10"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-grow h-px bg-black/5 dark:bg-white/5"></div>
            <span className="text-[9px] uppercase tracking-widest text-secondary/40 font-bold">OR</span>
            <div className="flex-grow h-px bg-black/5 dark:bg-white/5"></div>
          </div>

          <GoogleLoginButton text="Continue with Google" />
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-secondary/40 dark:text-secondary/60">
            Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline decoration-primary/30">Sign up now</Link>
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

export default Login;

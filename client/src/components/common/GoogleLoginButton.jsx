import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const GoogleLoginButton = ({ text = "Continue with Google" }) => {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Send access_token to backend
        await googleLogin(tokenResponse.access_token);
      } catch (error) {
        console.error('Google Login Error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
    }
  });

  return (
    <button
      onClick={() => login()}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm disabled:opacity-70 text-primary"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H1.02273V12.9927C2.50773 15.9382 5.51455 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V5.00727H1.02273C0.413182 6.20864 0 7.56409 0 9C0 10.4359 0.413182 11.7914 1.02273 12.9927L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.51455 0 2.50773 2.06182 1.02273 5.00727L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
          </svg>
          {text}
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;

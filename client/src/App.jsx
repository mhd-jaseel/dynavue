import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useOutlet, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis as Lenis } from '@studio-freight/react-lenis';
import React from 'react';
import { Toaster } from 'sonner';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import PageLoader from './components/common/PageLoader';

// Pages (Lazy Loaded)
const Home = React.lazy(() => import('./pages/Home'));
const Portfolio = React.lazy(() => import('./pages/Portfolio'));
const Services = React.lazy(() => import('./pages/Services'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const BookingSuccess = React.lazy(() => import('./pages/BookingSuccess'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// AnimatedOutlet handles Framer Motion page transitions perfectly with the Outlet pattern
const AnimatedOutlet = () => {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait">
      {element && React.cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
};

const RootLayout = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If admin is logged in, they should NOT be on the public site layout
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show navigation for regular users or guests */}
      {(!isAuthenticated || user?.role === 'user') && <TopNav />}
      
      <main className="flex-grow pb-[56px] md:pb-0 transition-colors duration-500">
        <AnimatedOutlet />
      </main>
      
      {(!isAuthenticated || user?.role === 'user') && <Footer />}
      {(!isAuthenticated || user?.role === 'user') && <BottomNav />}
    </div>
  );
};

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Or a minimal splash screen
  }

  return (
    <AuthProvider>
      <Lenis root options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        prevent: () => window.innerWidth < 768,
      }}>
        <BrowserRouter>
          <Toaster position="top-right" expand={false} richColors />
          <ScrollToTop />
          <React.Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<RootLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/booking-success" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <BookingSuccess />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Admin & Auth Routes (No standard navbar/footer) */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </Lenis>
    </AuthProvider>
  );
}

export default App;

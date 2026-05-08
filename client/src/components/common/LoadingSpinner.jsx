import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullPage = false }) => {
  const containerClasses = fullPage 
    ? "fixed inset-0 z-[100] flex items-center justify-center bg-base/80 backdrop-blur-sm" 
    : "flex items-center justify-center p-12";

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 text-[10px] uppercase tracking-[0.4em] text-primary/40 font-medium"
        >
          Curating...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

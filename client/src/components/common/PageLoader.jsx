import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 transition-colors duration-500">
      <div className="relative flex flex-col items-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border border-primary/5 rounded-full"
        />
        {/* Inner Spinner */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute top-2 left-2 w-12 h-12 border-2 border-transparent border-t-primary rounded-full"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-[10px] uppercase tracking-[0.5em] text-primary/60 font-light"
        >
          DYNAVUE
        </motion.p>
      </div>
    </div>
  );
};

export default PageLoader;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden font-outfit">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="relative z-10 max-w-md bg-white/70 dark:bg-[#080808]/65 backdrop-blur-2xl border border-slate-200/40 dark:border-slate-800/40 rounded-[28px] p-8 md:p-10 shadow-2xl text-center space-y-6"
      >
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-20 w-20 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm"
        >
          <AlertTriangle className="h-10 w-10" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-800 dark:text-white leading-none">404</h1>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Page not found</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-650 hover:from-brand-550 hover:to-indigo-550 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md shadow-brand-600/10 transition-all text-sm"
          >
            <Home className="h-5 w-5" />
            <span>Return Home</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;

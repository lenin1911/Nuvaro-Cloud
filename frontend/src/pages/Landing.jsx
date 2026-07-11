import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Sun, Moon, ArrowRight, Shield, HardDrive, Share2, Zap } from 'lucide-react';

const Landing = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden font-inter select-none">
      
      {/* Soft Floating Decorative Gradient Orbs */}
      <motion.div 
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] left-[15%] w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full filter blur-[80px] pointer-events-none" 
      />
      <motion.div 
        animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[20%] right-[15%] w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full filter blur-[100px] pointer-events-none" 
      />

      {/* Top Navbar */}
      <header className="relative z-20 w-full px-6 md:px-16 py-6 flex items-center justify-between">
        {/* Left: Nuvaro Cloud Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-md">
            <HardDrive className="h-5 w-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-outfit">
            Nuvaro Cloud
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Get Started CTA */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/login" 
              className="bg-white dark:bg-gradient-to-r dark:from-blue-600 dark:to-cyan-500 text-slate-900 dark:text-white border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:from-blue-550 dark:hover:to-cyan-405 font-bold text-xs px-5 py-3 rounded-full flex items-center space-x-1.5 shadow-sm dark:shadow-md dark:shadow-blue-500/10 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Main Headline */}
          <h1 className="leading-tight tracking-tight">
            {/* Serif line */}
            <span className="block font-serif text-[48px] sm:text-[68px] md:text-[88px] font-normal text-slate-800 dark:text-slate-100 italic">
              Cloud storage,
            </span>
            {/* Bold sans-serif line */}
            <span className="block text-[48px] sm:text-[68px] md:text-[88px] font-black text-slate-900 dark:text-white leading-none font-outfit tracking-tighter mt-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              built for everyone
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-550 dark:text-slate-350 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Store, sync, share, and protect your files with speed, security, and simplicity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Start Free (Gradient Primary) */}
            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)' }} 
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-550 hover:to-cyan-405 text-white font-bold text-sm px-8 py-4 rounded-full flex items-center justify-center shadow-md shadow-blue-500/10 active:scale-95 transition-all"
              >
                <span>Start Free</span>
              </Link>
            </motion.div>

            {/* Explore Platform (Glass Secondary) */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/login"
                className="bg-white/40 dark:bg-slate-950/20 hover:bg-white/60 dark:hover:bg-slate-900/30 text-slate-800 dark:text-white border border-slate-200/60 dark:border-slate-805/50 backdrop-blur-md font-bold text-sm px-8 py-4 rounded-full flex items-center justify-center transition-all"
              >
                <span>Explore Platform</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-20 w-full px-6 py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        &copy; {new Date().getFullYear()} Nuvaro Cloud. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;

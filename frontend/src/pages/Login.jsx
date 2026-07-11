import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HardDrive, Key, Mail, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const success = await login(usernameOrEmail, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Incorrect username/email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Auth Panel Wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-white/70 dark:bg-[#0b1329]/65 backdrop-blur-2xl border border-slate-200/40 dark:border-slate-800/40 rounded-[28px] p-8 md:p-10 shadow-2xl shadow-slate-200/40 dark:shadow-black/50"
      >
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="h-16 w-16 bg-brand-600 dark:bg-brand-500/20 border border-brand-500/20 text-white dark:text-brand-400 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/10 mb-4"
          >
            <HardDrive className="h-8 w-8" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight font-outfit">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Access your secure files from anywhere</p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center space-x-2 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 text-red-650 dark:text-red-400 p-4 rounded-xl text-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Username or Email
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 group-focus-within:text-brand-600 transition-colors">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter username or email"
                className="w-full bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900/90 focus:ring-4 focus:ring-brand-500/10 text-slate-850 dark:text-slate-200 pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all duration-200 text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 group-focus-within:text-brand-600 transition-colors">
                <Key className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900/90 focus:ring-4 focus:ring-brand-500/10 text-slate-850 dark:text-slate-200 pl-11 pr-11 py-3.5 rounded-2xl outline-none transition-all duration-200 text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)' }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-550 hover:to-indigo-550 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-md shadow-brand-600/10 disabled:opacity-70 disabled:pointer-events-none mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold transition-colors duration-200">
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

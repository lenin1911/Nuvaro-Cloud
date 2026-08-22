import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HardDrive, Key, Mail, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        usernameOrEmail.trim(),
        password
      );
      console.log("Logged in user:", userCredential.user);
      navigate('/');
    } catch (err) {
      console.error("Firebase auth error:", err);
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please check your credentials.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        default:
          setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Logged in with Google:", userCredential.user);
      navigate('/');
    } catch (err) {
      console.error("Google sign-in error:", err);
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-in popup was closed. Please try again.');
          break;
        case 'auth/popup-blocked':
          setError('Popup was blocked by your browser. Please allow popups for this site.');
          break;
        case 'auth/cancelled-popup-request':
          // Silently ignore — a second popup was opened before the first resolved
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with this email using a different sign-in method.');
          break;
        default:
          setError(err.message || 'Google Sign-In failed. Please try again.');
      }
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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80 dark:border-slate-800/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 dark:bg-[#0b1329] px-3 text-slate-400 dark:text-slate-500 font-semibold tracking-wider backdrop-blur-sm">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <motion.button
          id="google-login-btn"
          type="button"
          whileHover={{ scale: 1.01, boxShadow: '0 4px 15px -1px rgba(0, 0, 0, 0.05)' }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/60 font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-sm"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </motion.button>

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

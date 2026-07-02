import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HardDrive, Key, Mail, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-brand-600/10 border border-brand-500/20 rounded-2xl flex items-center justify-center text-brand-500 mb-4 shadow-lg">
            <HardDrive className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400 mt-2">Access your secure files from anywhere</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter username or email"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-brand-500 text-white pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Key className="h-5 w-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-brand-500 text-white pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-brand-600/25 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            disabled={loading}
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors duration-200">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

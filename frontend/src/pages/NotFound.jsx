import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      {/* Decorative Spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative z-10 max-w-md space-y-6">
        <div className="h-20 w-20 bg-brand-600/10 border border-brand-500/20 text-brand-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
          <AlertTriangle className="h-10 w-10 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white">404</h1>
          <h2 className="text-2xl font-bold text-slate-200">Page not found</h2>
          <p className="text-slate-400 max-w-xs mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-600/20 active:scale-95 transition-all"
        >
          <Home className="h-5 w-5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

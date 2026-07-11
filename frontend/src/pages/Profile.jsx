import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-outfit">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account details and security settings</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="bg-white/45 dark:bg-[#0b1329]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[28px] p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl" />
        
        {/* Profile Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-200/40 dark:border-slate-800/40">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="h-16 w-16 bg-gradient-to-tr from-brand-655 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md shadow-brand-600/10"
          >
            {user.username.substring(0, 2).toUpperCase()}
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user.username}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Standard Storage Account</p>
          </div>
        </div>

        {/* Info list */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center space-x-3.5 text-slate-700 dark:text-slate-300">
            <div className="p-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/40 rounded-xl text-brand-600 dark:text-brand-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-bold mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 text-slate-700 dark:text-slate-300">
            <div className="p-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/40 rounded-xl text-brand-600 dark:text-brand-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Member Since</p>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-bold mt-0.5">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 text-slate-700 dark:text-slate-300">
            <div className="p-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/40 rounded-xl text-brand-600 dark:text-brand-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Authentication Status</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center space-x-1 mt-0.5">
                <span>Verified JWT session</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

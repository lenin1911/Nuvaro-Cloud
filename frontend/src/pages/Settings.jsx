import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Server, HardDrive, Bell } from 'lucide-react';

const Settings = () => {
  const [notify, setNotify] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-outfit">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your cloud storage preferences and review system parameters</p>
      </div>

      <div className="space-y-6">
        
        {/* API Details */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/45 dark:bg-[#080808]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[28px] p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200/40 dark:border-slate-800/30">
            <Server className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">API Configuration</h2>
          </div>
          <div className="space-y-3.5 text-sm font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Backend API URL</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 text-xs bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/40 px-2 py-0.5 rounded-lg">http://localhost:8000/api</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Rate Limiting</span>
              <span className="text-slate-800 dark:text-slate-200">120 requests/minute per IP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">CORS Policy</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Strict Credentials Allowed</span>
            </div>
          </div>
        </motion.div>

        {/* AWS Storage Information */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white/45 dark:bg-[#080808]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[28px] p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200/40 dark:border-slate-800/30">
            <HardDrive className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">AWS Storage Parameters</h2>
          </div>
          <div className="space-y-3.5 text-sm font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">AWS Region</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 text-xs bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/40 px-2 py-0.5 rounded-lg">us-east-1 (Default)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Storage Provider</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold">AWS S3 (LocalStack fallback)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">MIME Filter</span>
              <span className="text-slate-800 dark:text-slate-200">PDF, JPG, PNG, WEBP, MP4, WEBM, DOCX, ZIP</span>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white/45 dark:bg-[#080808]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[28px] p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200/40 dark:border-slate-800/30">
            <Bell className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">User Preferences</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-250">Upload notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Show notifications when S3 uploads finish</p>
            </div>
            <button
              onClick={() => setNotify(!notify)}
              className={`
                relative w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none shrink-0
                ${notify ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}
              `}
            >
              <motion.div 
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="bg-white w-4 h-4 rounded-full shadow-sm"
                style={{ marginLeft: notify ? '24px' : '0px' }}
              />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Server, HardDrive, Bell } from 'lucide-react';

const Settings = () => {
  const [notify, setNotify] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your cloud storage preferences and review system parameters</p>
      </div>

      <div className="space-y-6">
        
        {/* API Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <Server className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">API Configuration</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Backend API URL</span>
              <span className="font-mono text-white text-xs">http://localhost:8000/api</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rate Limiting</span>
              <span className="text-white">120 requests/minute per IP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CORS Policy</span>
              <span className="text-emerald-400 font-semibold">Strict Credentials Allowed</span>
            </div>
          </div>
        </div>

        {/* AWS Storage Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <HardDrive className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">AWS Storage Parameters</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">AWS Region</span>
              <span className="font-mono text-white text-xs">us-east-1 (Default)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Storage Provider</span>
              <span className="text-brand-400 font-semibold">AWS S3 (LocalStack fallback)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MIME Filter</span>
              <span className="text-white">PDF, JPG, PNG, WEBP, MP4, WEBM, DOCX, ZIP</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <Bell className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">User Preferences</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Upload notifications</p>
              <p className="text-xs text-slate-400 mt-0.5">Show notifications when S3 uploads finish</p>
            </div>
            <button
              onClick={() => setNotify(!notify)}
              className={`
                w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none
                ${notify ? 'bg-brand-600' : 'bg-slate-800'}
              `}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${notify ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;

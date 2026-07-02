import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Key, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account details and security settings</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/5 rounded-full blur-2xl" />
        
        {/* Profile Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
          <div className="h-16 w-16 bg-brand-600/10 border border-brand-500/20 text-brand-500 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <p className="text-sm text-slate-400">Standard Storage Account</p>
          </div>
        </div>

        {/* Info list */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-3 text-slate-350">
            <Mail className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Email Address</p>
              <p className="text-sm text-white font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-350">
            <Calendar className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Member Since</p>
              <p className="text-sm text-white font-medium">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-350">
            <ShieldCheck className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Authentication Status</p>
              <p className="text-sm text-emerald-400 font-semibold flex items-center space-x-1 mt-0.5">
                <span>Verified JWT session</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

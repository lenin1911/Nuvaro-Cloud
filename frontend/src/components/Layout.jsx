import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HardDrive, 
  Menu, 
  X, 
  UploadCloud, 
  User, 
  Settings as SettingsIcon, 
  LogOut,
  Sun,
  Moon,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, setTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HardDrive },
    { name: 'My Files', href: '/files', icon: HardDrive },
    { name: 'Upload', href: '/upload', icon: UploadCloud },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative z-10 text-slate-800 dark:text-slate-200 transition-colors duration-500">
      
      {/* Mobile Top Navbar (Glassmorphic) */}
      <div className="md:hidden flex items-center justify-between bg-white/70 dark:bg-[#0b1329]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/40 px-4 py-3 z-30">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-6 w-6 text-brand-600 dark:text-brand-500" />
          <span className="text-lg font-black bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent font-outfit">
            Nuvaro Cloud
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors duration-200"
          >
            {isDark ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside className={`
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        w-64 bg-white/60 dark:bg-[#090f1e]/60 backdrop-blur-xl md:backdrop-blur-lg border-r border-slate-200/55 dark:border-slate-850/50 p-6 flex flex-col justify-between z-40
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Desktop Logo */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-brand-600 dark:bg-brand-500/20 text-white dark:text-brand-400 rounded-2xl shadow-md shadow-brand-600/10">
                <HardDrive className="h-6 w-6" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent font-outfit tracking-tight">
                Nuvaro
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 group font-semibold text-sm
                    ${active 
                      ? 'text-white' 
                      : 'text-slate-550 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'}
                  `}
                >
                  {/* Sliding active capsule */}
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-brand-600 dark:bg-brand-600 rounded-xl z-0 shadow-lg shadow-brand-600/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon className={`relative z-10 h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${active ? 'text-white' : 'text-slate-450 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400'}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/40 space-y-4">
          {/* Theme Selector (Desktop) */}
          <div className="hidden md:flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 p-1 rounded-2xl">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${!isDark ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isDark ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-450 hover:text-slate-800'}`}
            >
              <Moon className="h-4 w-4 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>

          {user && (
            <div className="flex items-center space-x-3 px-2">
              <div className="h-10 w-10 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/5 hover:text-red-600 transition-colors duration-200 font-semibold text-sm"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Frame (Animated pages wrapper) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-30">
        
        {/* Desktop Top Header Bar (Glassmorphic) */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-white/30 dark:bg-[#090f1e]/20 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/30">
          <div>
            {/* Search container placeholder */}
            <div className="relative w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search storage..."
                className="w-full bg-white/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 focus:border-brand-500 text-xs pl-10 pr-4 py-2.5 rounded-2xl outline-none transition-all dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl hover:bg-white/60 dark:hover:bg-slate-900/40 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/40 text-slate-500 dark:text-slate-400 transition-all">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
            </button>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-900/40 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/40 transition-all"
                >
                  <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.username}</span>
                  <ChevronDown className="h-4 w-4 text-slate-455" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl py-2 z-50 text-left"
                      >
                        <Link 
                          to="/profile" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold"
                        >
                          My Profile
                        </Link>
                        <Link 
                          to="/settings" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold"
                        >
                          Account Settings
                        </Link>
                        <hr className="my-1 border-slate-100 dark:border-slate-900" />
                        <button 
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 font-bold"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile drawer background shadow */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-sm"
        />
      )}
    </div>
  );
};

export default Layout;

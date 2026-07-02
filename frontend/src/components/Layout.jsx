import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderOpen, 
  UploadCloud, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  HardDrive
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Files', href: '/files', icon: FolderOpen },
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
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3 z-20">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-6 w-6 text-brand-500" />
          <span className="text-lg font-bold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
            Nuvaro Cloud
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside className={`
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-slate-900/90 backdrop-blur-md md:bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between z-30
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo */}
          <div className="hidden md:flex items-center space-x-3">
            <HardDrive className="h-8 w-8 text-brand-500 animate-pulse" />
            <span className="text-xl font-black bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
              Nuvaro Cloud
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${active 
                      ? 'bg-brand-600 text-white font-medium shadow-lg shadow-brand-600/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          {user && (
            <div className="flex items-center space-x-3 px-2">
              <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white shadow-md">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative z-10">
        {children}
      </main>

      {/* Mobile drawer background shadow */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
        />
      )}
    </div>
  );
};

export default Layout;

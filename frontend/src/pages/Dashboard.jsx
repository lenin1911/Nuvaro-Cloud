import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Archive, 
  File, 
  TrendingUp, 
  HardDrive, 
  Plus, 
  ArrowRight,
  Loader,
  AlertCircle,
  Download
} from 'lucide-react';

export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType) => {
  const mime = mimeType.toLowerCase();
  if (mime.includes('pdf')) return <FileText className="h-6 w-6 text-red-500 dark:text-red-400" />;
  if (mime.includes('image/')) return <ImageIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />;
  if (mime.includes('video/')) return <VideoIcon className="h-6 w-6 text-amber-500 dark:text-amber-400" />;
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('compressed')) {
    return <Archive className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />;
  }
  return <File className="h-6 w-6 text-blue-500 dark:text-blue-400" />;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await api.get('/files/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not load storage stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await api.get(`/files/download/${fileId}`);
      const { download_url, is_local } = response.data;
      
      if (is_local) {
        window.open(`http://localhost:8000${download_url}`, '_blank');
      } else {
        window.open(download_url, '_blank');
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 text-brand-600 dark:text-brand-500 animate-spin" />
      </div>
    );
  }

  const storageUsed = stats?.total_size || 0;
  const storageLimit = stats?.storage_limit || (100 * 1024 * 1024 * 1024); // 100 GB
  const percentage = Math.min(((storageUsed / storageLimit) * 100), 100).toFixed(2);

  return (
    <div className="space-y-8 font-outfit">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Get an overview of your storage space and files</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/upload" 
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-650 hover:from-brand-550 hover:to-indigo-550 text-white px-5 py-3 rounded-2xl transition-all duration-200 shadow-md shadow-brand-600/10 font-bold"
          >
            <Plus className="h-5 w-5" />
            <span>Upload File</span>
          </Link>
        </motion.div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 text-red-650 dark:text-red-400 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of stats */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        
        {/* Storage usage card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.08)' }}
          className="bg-white/45 dark:bg-[#0b1329]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[24px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-350" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Storage Used</h2>
            <HardDrive className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{formatBytes(storageUsed)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">of {formatBytes(storageLimit)} quota limit</p>
            </div>
            
            {/* Progress bar */}
            <div>
              <div className="w-full bg-slate-100 dark:bg-slate-900/60 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-brand-655 dark:bg-brand-500 h-2.5 rounded-full shadow-inner shadow-brand-500/15" 
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs font-semibold">
                <span className="text-brand-600 dark:text-brand-400">{percentage}% used</span>
                <span className="text-slate-500 dark:text-slate-400">{formatBytes(storageLimit - storageUsed)} free</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Files Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.08)' }}
          className="bg-white/45 dark:bg-[#0b1329]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[24px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-350" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Total Files</h2>
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-5xl font-black text-slate-800 dark:text-white">{stats?.total_files || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Active assets uploaded in cloud storage</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900/40">
            <Link to="/files" className="inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 space-x-1">
              <span>View all files</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Upload Activity card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.08)' }}
          className="bg-white/45 dark:bg-[#0b1329]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[24px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-350" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Bandwidth Usage</h2>
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">Unlimited</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Zero speed limits on downloads and uploads</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900/40">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 flex items-center space-x-1">
              <span>Connection secure (HTTPS/SSL)</span>
            </span>
          </div>
        </motion.div>

      </motion.div>

      {/* Recent Files Table */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white/45 dark:bg-[#0b1329]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[28px] p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Uploads</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Quick access to files uploaded recently</p>
          </div>
          <Link to="/files" className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center space-x-1">
            <span>See All Files</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {!stats?.recent_uploads || stats.recent_uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-455 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/20 dark:bg-slate-950/20">
            <File className="h-12 w-12 stroke-[1.5] mb-2 text-slate-350 dark:text-slate-500" />
            <p className="text-sm">You haven't uploaded any files yet.</p>
            <Link to="/upload" className="text-brand-600 dark:text-brand-455 hover:text-brand-500 font-bold text-sm mt-2">
              Upload your first file now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/40 text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-4">Name</th>
                  <th className="pb-3">Uploaded</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Visibility</th>
                  <th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/40 dark:divide-slate-800/20">
                {stats.recent_uploads.map((file) => (
                  <tr key={file.id} className="text-sm hover:bg-white/40 dark:hover:bg-slate-900/20 transition-colors duration-150">
                    <td className="py-4 pl-4 flex items-center space-x-3">
                      <div className="shrink-0 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/35">
                        {getFileIcon(file.mime_type)}
                      </div>
                      <div className="truncate max-w-[200px] md:max-w-xs">
                        <span className="font-semibold text-slate-850 dark:text-slate-200 truncate block">{file.filename}</span>
                        <span className="text-xs text-slate-450 dark:text-slate-400 block truncate">{file.mime_type}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-350">
                      {new Date(file.upload_time).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-350">{formatBytes(file.size)}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${file.is_public ? 'bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350'}`}>
                        {file.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(file.id, file.filename)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/40 transition-all"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;

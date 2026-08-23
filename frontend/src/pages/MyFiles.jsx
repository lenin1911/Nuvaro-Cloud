import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatBytes, getFileIcon } from './Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  MoreVertical, 
  Loader, 
  AlertCircle,
  EyeOff
} from 'lucide-react';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('upload_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Modal / Operations state
  const [previewFile, setPreviewFile] = useState(null);
  const [renameFile, setRenameFile] = useState(null);
  const [newName, setNewName] = useState('');
  const [deleteConfirmFile, setDeleteConfirmFile] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null); // id of file whose menu is open

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/files', {
        params: {
          q: search || undefined,
          type: category || undefined,
          sort_by: sortBy,
          sort_order: sortOrder
        }
      });
      setFiles(response.data);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Could not load files list. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFiles();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, category, sortBy, sortOrder]);

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/download/${file.id}`);
      const { download_url, is_local } = response.data;
      
      const link = document.createElement('a');
      link.href = is_local ? `http://localhost:8000${download_url}` : download_url;
      link.setAttribute('download', file.filename);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to get download url:', err);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !renameFile) return;

    try {
      const response = await api.put(`/files/${renameFile.id}`, {
        filename: newName
      });
      setFiles(files.map(f => f.id === renameFile.id ? response.data : f));
      setRenameFile(null);
      setNewName('');
    } catch (err) {
      console.error('Failed to rename file:', err);
      alert('Rename failed: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmFile) return;

    try {
      await api.delete(`/files/${deleteConfirmFile.id}`);
      setFiles(files.filter(f => f.id !== deleteConfirmFile.id));
      setDeleteConfirmFile(null);
    } catch (err) {
      console.error('Failed to delete file:', err);
      alert('Delete failed.');
    }
  };

  const handleTogglePublic = async (file) => {
    try {
      const response = await api.put(`/files/${file.id}`, {
        is_public: !file.is_public
      });
      setFiles(files.map(f => f.id === file.id ? response.data : f));
    } catch (err) {
      console.error('Toggle public status failed:', err);
    }
  };

  const getPreviewUrl = (file) => {
    const token = localStorage.getItem('token');
    if (file.s3_key.startsWith('uploads/')) {
      return `http://localhost:8000/api/files/download-local/${file.s3_key}?token=${token}`;
    }
    return `http://localhost:8000/api/files/download/${file.id}?token=${token}`;
  };

  const isPreviewable = (mimeType) => {
    const mime = mimeType.toLowerCase();
    return mime.startsWith('image/') || mime.startsWith('video/') || mime === 'application/pdf';
  };

  return (
    <div className="space-y-8 font-outfit">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">My Files</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and access all your cloud storage files</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-white/50 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 p-1.5 rounded-2xl self-end shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-850 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-white dark:bg-slate-850 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 text-red-650 dark:text-red-400 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white/45 dark:bg-[#080808]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 p-5 rounded-[24px] grid grid-cols-1 md:grid-cols-4 gap-4 items-center shadow-sm">
        
        {/* Search */}
        <div className="relative md:col-span-2 group">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 group-focus-within:text-brand-655 transition-colors">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900/90 text-slate-800 dark:text-slate-200 pl-11 pr-4 py-3 rounded-2xl outline-none transition-all text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900/90 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-2xl outline-none transition-all appearance-none cursor-pointer font-bold text-sm"
          >
            <option value="">All Categories</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
            <option value="document">Documents</option>
            <option value="zip">Archives (ZIP)</option>
          </select>
        </div>

        {/* Sorting selection */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900/90 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-2xl outline-none transition-all appearance-none cursor-pointer font-bold text-sm"
          >
            <option value="upload_time">Date Uploaded</option>
            <option value="size">File Size</option>
            <option value="filename">Name</option>
          </select>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 px-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors font-bold text-xs uppercase"
          >
            {sortOrder}
          </motion.button>
        </div>

      </div>

      {/* Main Files Display */}
      {loading ? (
        <div className="h-48 flex items-center justify-center animate-pulse">
          <Loader className="h-8 w-8 text-brand-600 dark:text-brand-500 animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-455 dark:text-slate-400 bg-white/45 dark:bg-[#080808]/30 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm border-dashed">
          <AlertCircle className="h-12 w-12 stroke-[1.5] mb-2 text-slate-350 dark:text-slate-500" />
          <p className="text-sm">No files found matching criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* Grid Layout */
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {files.map((file) => (
            <motion.div 
              layout
              key={file.id}
              whileHover={{ y: -3, boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.06)' }}
              className="bg-white/45 dark:bg-[#080808]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[28px] p-5 transition-all duration-200 group flex flex-col justify-between h-48 relative shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/35 p-3 rounded-2xl">
                  {getFileIcon(file.mime_type)}
                </div>
                
                {/* Dots menu dropdown wrapper */}
                <div className="relative">
                  <button 
                    onClick={() => setActionMenuOpen(actionMenuOpen === file.id ? null : file.id)}
                    className="text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  <AnimatePresence>
                    {actionMenuOpen === file.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl py-2 z-20 text-left font-outfit"
                        >
                          {isPreviewable(file.mime_type) && (
                            <button
                              onClick={() => {
                                setPreviewFile(file);
                                setActionMenuOpen(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center space-x-2 font-semibold"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Preview</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setRenameFile(file);
                              setNewName(file.filename);
                              setActionMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center space-x-2 font-semibold"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => {
                              handleTogglePublic(file);
                              setActionMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center space-x-2 font-semibold"
                          >
                            {file.is_public ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-emerald-600" />}
                            <span>{file.is_public ? 'Make Private' : 'Make Public'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmFile(file);
                              setActionMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 flex items-center space-x-2 font-bold"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-full" title={file.filename}>
                  {file.filename}
                </h3>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500 dark:text-slate-405 font-semibold">
                  <span>{formatBytes(file.size)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${file.is_public ? 'bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400'}`}>
                    {file.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              {/* Hover actions panel */}
              <div className="absolute inset-x-5 bottom-4 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(file)}
                  className="bg-brand-600 hover:bg-brand-500 text-white p-2.5 rounded-xl shadow-md transition-transform"
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        
        /* List Layout */
        <div className="bg-white/45 dark:bg-[#080808]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[28px] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/40 text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 pl-6">Name</th>
                <th className="py-4">Uploaded</th>
                <th className="py-4">Size</th>
                <th className="py-4">Visibility</th>
                <th className="py-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/40 dark:divide-slate-800/20">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-white/40 dark:hover:bg-slate-900/10 text-sm transition-colors duration-150">
                  <td className="py-4 pl-6 flex items-center space-x-3">
                    <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/45 dark:border-slate-800/35 p-2 rounded-xl">
                      {getFileIcon(file.mime_type)}
                    </div>
                    <div className="truncate max-w-xs md:max-w-md">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{file.filename}</span>
                      <span className="text-xs text-slate-450 dark:text-slate-400 block truncate">{file.mime_type}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-350">
                    {new Date(file.upload_time).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-350">{formatBytes(file.size)}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${file.is_public ? 'bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-350'}`}>
                      {file.is_public ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-right space-x-1">
                    {isPreviewable(file.mime_type) && (
                      <button 
                        onClick={() => setPreviewFile(file)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors"
                        title="Preview File"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDownload(file)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors"
                      title="Download File"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setRenameFile(file);
                        setNewName(file.filename);
                      }}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors"
                      title="Rename Metadata"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmFile(file)}
                      className="text-red-500 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-xl transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS ANIME PRESENCE */}
      <AnimatePresence>
        {/* RENAME MODAL */}
        {renameFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRenameFile(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-[28px] p-6 w-full max-w-md shadow-2xl z-10"
            >
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Rename File</h2>
              <form onSubmit={handleRename} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    New Filename
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-2xl outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setRenameFile(null)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all font-bold text-sm shadow-md shadow-brand-600/10"
                  >
                    Rename
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmFile(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-[28px] p-6 w-full max-w-md shadow-2xl z-10"
            >
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete File</h2>
              <p className="text-sm text-slate-550 dark:text-slate-400 mb-6">
                Are you sure you want to permanently delete <strong className="text-slate-850 dark:text-white font-bold">{deleteConfirmFile.filename}</strong>? This action will remove it from AWS S3, and cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmFile(null)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all font-bold text-sm shadow-md shadow-red-600/10"
                >
                  Delete File
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* PREVIEW MODAL */}
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-[28px] w-full max-w-4xl h-[80vh] shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-900">
                <div>
                  <h2 className="text-lg font-bold text-slate-850 dark:text-white truncate max-w-[250px] md:max-w-[500px]">
                    {previewFile.filename}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{previewFile.mime_type} • {formatBytes(previewFile.size)}</p>
                </div>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="text-slate-450 hover:text-slate-850 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center p-6 overflow-hidden">
                {previewFile.mime_type.startsWith('image/') ? (
                  <img 
                    src={getPreviewUrl(previewFile)} 
                    alt={previewFile.filename} 
                    className="max-w-full max-h-full object-contain rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/40"
                  />
                ) : previewFile.mime_type.startsWith('video/') ? (
                  <video 
                    controls 
                    className="max-w-full max-h-full rounded-xl shadow-sm"
                    src={getPreviewUrl(previewFile)}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : previewFile.mime_type === 'application/pdf' ? (
                  <iframe 
                    src={getPreviewUrl(previewFile)} 
                    className="w-full h-full rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/40"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <p>No preview is available for this file type.</p>
                    <button 
                      onClick={() => handleDownload(previewFile)}
                      className="mt-4 bg-brand-600 hover:bg-brand-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md"
                    >
                      Download to View
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyFiles;

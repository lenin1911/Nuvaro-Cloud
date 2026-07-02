import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatBytes, getFileIcon } from './Dashboard';
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

  // Fetch files when search, category, or sorting changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFiles();
    }, 300); // Debounce typing

    return () => clearTimeout(delayDebounce);
  }, [search, category, sortBy, sortOrder]);

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/download/${file.id}`);
      const { download_url, is_local } = response.data;
      
      const link = document.createElement('a');
      link.href = is_local ? `http://localhost:8000${download_url}` : download_url;
      link.setAttribute('download', file.filename);
      // Open in a new tab to avoid breaking browser state
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
      // Update in state
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
    // If it's local storage fallback, point to download local route
    if (file.s3_key.startsWith('uploads/')) {
      return `http://localhost:8000/api/files/download-local/${file.s3_key}?token=${token}`;
    }
    // Return relative backend download link which returns S3 URL or streams
    return `http://localhost:8000/api/files/download/${file.id}?token=${token}`;
  };

  const isPreviewable = (mimeType) => {
    const mime = mimeType.toLowerCase();
    return mime.startsWith('image/') || mime.startsWith('video/') || mime === 'application/pdf';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Files</h1>
          <p className="text-slate-400 mt-1">Manage and access all your cloud storage files</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-end">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/40 border border-slate-850 focus:border-brand-500 text-white pl-10 pr-4 py-3 rounded-2xl outline-none transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950/40 border border-slate-850 focus:border-brand-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors appearance-none cursor-pointer"
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
            className="flex-1 bg-slate-950/40 border border-slate-850 focus:border-brand-500 text-white px-4 py-3 rounded-2xl outline-none transition-colors appearance-none cursor-pointer"
          >
            <option value="upload_time">Date Uploaded</option>
            <option value="size">File Size</option>
            <option value="filename">Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-slate-950/40 border border-slate-850 px-4 rounded-2xl text-slate-400 hover:text-white transition-colors"
          >
            {sortOrder.toUpperCase()}
          </button>
        </div>

      </div>

      {/* Main Files Display */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl border-dashed">
          <AlertCircle className="h-12 w-12 stroke-[1.5] mb-2" />
          <p className="text-sm">No files found matching criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 hover:bg-slate-800/10 transition-all duration-200 group flex flex-col justify-between h-48 relative"
            >
              <div className="flex justify-between items-start">
                <div className="bg-slate-950/40 p-3 rounded-xl">
                  {getFileIcon(file.mime_type)}
                </div>
                
                {/* Dots menu dropdown wrapper */}
                <div className="relative">
                  <button 
                    onClick={() => setActionMenuOpen(actionMenuOpen === file.id ? null : file.id)}
                    className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {actionMenuOpen === file.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl py-2 z-10 text-left">
                      {isPreviewable(file.mime_type) && (
                        <button
                          onClick={() => {
                            setPreviewFile(file);
                            setActionMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-900 flex items-center space-x-2"
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
                        className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-900 flex items-center space-x-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => {
                          handleTogglePublic(file);
                          setActionMenuOpen(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-900 flex items-center space-x-2"
                      >
                        {file.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span>{file.is_public ? 'Make Private' : 'Make Public'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirmFile(file);
                          setActionMenuOpen(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-900 flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white truncate max-w-full" title={file.filename}>
                  {file.filename}
                </h3>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-400 font-medium">
                  <span>{formatBytes(file.size)}</span>
                  <span className={`px-2 py-0.5 rounded-full ${file.is_public ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {file.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              {/* Hover actions panel */}
              <div className="absolute inset-x-5 bottom-4 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                <button 
                  onClick={() => handleDownload(file)}
                  className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-xl shadow-lg transition-transform hover:scale-105"
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        
        /* List Layout */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 pl-6">Name</th>
                <th className="py-4">Uploaded</th>
                <th className="py-4">Size</th>
                <th className="py-4">Visibility</th>
                <th className="py-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-850/20 text-sm transition-colors">
                  <td className="py-4 pl-6 flex items-center space-x-3">
                    <div className="bg-slate-950/20 p-2.5 rounded-lg">
                      {getFileIcon(file.mime_type)}
                    </div>
                    <div className="truncate max-w-xs md:max-w-md">
                      <span className="font-semibold text-white truncate block">{file.filename}</span>
                      <span className="text-xs text-slate-500 block truncate">{file.mime_type}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-400">
                    {new Date(file.upload_time).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 text-slate-400">{formatBytes(file.size)}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${file.is_public ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {file.is_public ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-right space-x-1">
                    {isPreviewable(file.mime_type) && (
                      <button 
                        onClick={() => setPreviewFile(file)}
                        className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg"
                        title="Preview File"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDownload(file)}
                      className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg"
                      title="Download File"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setRenameFile(file);
                        setNewName(file.filename);
                      }}
                      className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg"
                      title="Rename Metadata"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmFile(file)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg"
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

      {/* RENAME MODAL */}
      {renameFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-bold text-white mb-4">Rename File</h2>
            <form onSubmit={handleRename} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  New Filename
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 text-white px-4 py-3 rounded-2xl outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setRenameFile(null)}
                  className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all font-semibold shadow-md shadow-brand-600/10"
                >
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-bold text-white mb-2">Delete File</h2>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to permanently delete <strong className="text-white">{deleteConfirmFile.filename}</strong>? This action will remove the file metadata and erase it from AWS S3, and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmFile(null)}
                className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all font-semibold shadow-md"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[80vh] shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white truncate max-w-[250px] md:max-w-[500px]">
                  {previewFile.filename}
                </h2>
                <p className="text-xs text-slate-400">{previewFile.mime_type} • {formatBytes(previewFile.size)}</p>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body (Responsive Preview Content) */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
              {previewFile.mime_type.startsWith('image/') ? (
                <img 
                  src={getPreviewUrl(previewFile)} 
                  alt={previewFile.filename} 
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : previewFile.mime_type.startsWith('video/') ? (
                <video 
                  controls 
                  className="max-w-full max-h-full rounded-lg"
                  src={getPreviewUrl(previewFile)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : previewFile.mime_type === 'application/pdf' ? (
                <iframe 
                  src={getPreviewUrl(previewFile)} 
                  className="w-full h-full rounded-lg"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <p>No preview is available for this file type.</p>
                  <button 
                    onClick={() => handleDownload(previewFile)}
                    className="mt-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2 rounded-xl"
                  >
                    Download to View
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;

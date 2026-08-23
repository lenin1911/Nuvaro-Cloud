import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { UploadCloud, File, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const SUPPORTED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
  'text/plain', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint', 
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed', 'application/x-tar', 'application/x-gzip', 'application/x-rar-compressed', 'application/x-7z-compressed'
];

const UploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    if (!SUPPORTED_TYPES.includes(selectedFile.type) && selectedFile.type !== "") {
      console.warn('Unknown MIME on client:', selectedFile.type);
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Max limit is 100MB.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setError('');
    
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_public', isPublic);

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setFile(null);
      setTimeout(() => {
        navigate('/files');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Failed to upload file. Please verify file type and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-outfit">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Upload File</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Upload files securely to AWS S3 storage bucket</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 text-red-655 dark:text-red-400 p-4 rounded-xl text-sm"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 text-emerald-650 dark:text-emerald-450 p-4 rounded-xl text-sm"
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>File uploaded successfully! Redirecting...</span>
        </motion.div>
      )}

      <form onSubmit={handleUploadSubmit} className="bg-white/45 dark:bg-[#080808]/30 backdrop-blur-md border border-white/30 dark:border-slate-800/40 rounded-[28px] p-6 md:p-8 space-y-6 shadow-sm">
        
        {/* File Dropzone */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          whileHover={!file ? { scale: 1.005 } : {}}
          className={`
            border-2 border-dashed rounded-[20px] p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
            ${file ? 'border-brand-500/25 bg-slate-50/20 dark:bg-slate-950/10 cursor-default' : 'border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-450 hover:bg-white/60 dark:hover:bg-slate-900/20'}
            ${dragOver ? 'border-brand-600 bg-brand-500/5 dark:bg-brand-500/10' : ''}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={loading || success}
          />

          {file ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40"
            >
              <div className="flex items-center space-x-3 truncate">
                <div className="p-2.5 bg-brand-50 dark:bg-brand-500/10 rounded-xl text-brand-655 dark:text-brand-400">
                  <File className="h-7 w-7 shrink-0" />
                </div>
                <div className="truncate text-left font-outfit">
                  <p className="text-sm font-bold text-slate-850 dark:text-slate-100 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div 
                animate={dragOver ? { y: -5 } : { y: 0 }}
                className="h-16 w-16 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm"
              >
                <UploadCloud className="h-8 w-8" />
              </motion.div>
              <div>
                <p className="text-base font-bold text-slate-800 dark:text-white">Drag and drop file here</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or click to browse your local filesystem</p>
              </div>
              <p className="text-xs text-slate-455 dark:text-slate-500 font-semibold">
                Supports PDF, Images, Videos, Office Docs, and ZIP folders (max 100MB)
              </p>
            </div>
          )}
        </motion.div>

        {/* Public Visibility Toggle */}
        <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 p-4 rounded-[20px] flex items-start space-x-3">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mt-1 h-4 w-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded text-brand-655 focus:ring-brand-500/25"
            disabled={loading || success}
          />
          <div className="text-left font-outfit">
            <label htmlFor="isPublic" className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
              Make file public
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
              Public files generate a direct download url that is accessible by anyone, even without logging in. Keep this disabled for private files.
            </p>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.2)' }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="w-full flex items-center justify-center bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-550 hover:to-indigo-550 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-md shadow-brand-600/10 disabled:opacity-50 disabled:pointer-events-none"
          disabled={!file || loading || success}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader className="h-5 w-5 animate-spin" />
              <span>Uploading to S3...</span>
            </div>
          ) : (
            'Start Secure Upload'
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default UploadPage;
